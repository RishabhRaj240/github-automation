import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import { decryptToken } from '../_shared/crypto.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_SECRET') || 'repopilot-secret-key-32-chars-long!';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userJwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(userJwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { repoName, description, visibility, files, readmeContent } = body;

    if (!repoName || typeof repoName !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid repository name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Retrieve user's encrypted GitHub token
    const { data: conn, error: connError } = await supabase
      .from('github_connections')
      .select('encrypted_access_token, token_iv, github_username')
      .eq('user_id', user.id)
      .single();

    if (connError || !conn) {
      return new Response(JSON.stringify({ error: 'GitHub account not connected. Please connect your GitHub account.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = await decryptToken(conn.encrypted_access_token, conn.token_iv, encryptionKey);
    const owner = conn.github_username;

    // 1. Check if repo already exists
    const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (checkRes.status === 200) {
      return new Response(JSON.stringify({ error: `Repository '${owner}/${repoName}' already exists on GitHub.` }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Create Repository on GitHub
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description: description || 'Created with RepoPilot AI',
        private: visibility === 'private',
        auto_init: true,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: err.message || 'GitHub failed to create repository' }), {
        status: createRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const repoData = await createRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    // Allow GitHub to finish init
    await new Promise((r) => setTimeout(r, 1200));

    // Combine files with README
    const allFiles = [
      ...(files || []).filter((f: { path: string }) => f.path.toLowerCase() !== 'readme.md'),
      { path: 'README.md', content: readmeContent || `# ${repoName}\n\n${description}` },
    ];

    // Upload blobs
    const treeItems = [];
    for (const file of allFiles) {
      const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/blobs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: file.content,
          encoding: 'utf-8',
        }),
      });

      if (!blobRes.ok) {
        throw new Error(`Failed to upload blob for ${file.path}`);
      }
      const blobData = await blobRes.json();
      treeItems.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }

    // Get current HEAD ref
    let baseTreeSha: string | null = null;
    let baseCommitSha: string | null = null;

    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${defaultBranch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (refRes.ok) {
      const refData = await refRes.json();
      baseCommitSha = refData.object.sha;
      const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits/${baseCommitSha}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      }
    }

    // Create Tree
    const treePayload: Record<string, unknown> = { tree: treeItems };
    if (baseTreeSha) treePayload.base_tree = baseTreeSha;

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(treePayload),
    });

    const treeData = await treeRes.json();

    // Create Commit
    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Initial commit: scaffold project with RepoPilot AI\n\n- ${allFiles.length} files published`,
        tree: treeData.sha,
        parents: baseCommitSha ? [baseCommitSha] : [],
      }),
    });

    const commitData = await commitRes.json();

    // Update Head Ref
    await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${defaultBranch}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sha: commitData.sha,
        force: true,
      }),
    });

    // Record publication in Supabase
    await supabase.from('publications').insert({
      user_id: user.id,
      github_repository_id: String(repoData.id),
      repository_name: repoName,
      repository_url: repoData.html_url,
      commit_sha: commitData.sha.substring(0, 7),
      files_count: allFiles.length,
      visibility,
      status: 'success',
      published_at: new Date().toISOString(),
    });

    // Record usage event
    await supabase.from('usage_events').insert({
      user_id: user.id,
      event_type: 'repo_published',
      usage_metadata: { repoName, filesCount: allFiles.length, visibility },
    });

    return new Response(
      JSON.stringify({
        success: true,
        repoUrl: repoData.html_url,
        repoName,
        owner,
        commitSha: commitData.sha.substring(0, 7),
        branch: defaultBranch,
        filesPublished: allFiles.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


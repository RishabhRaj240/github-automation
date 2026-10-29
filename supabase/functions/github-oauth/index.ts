import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import { encryptToken } from '../_shared/crypto.ts';

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
    const githubClientId = Deno.env.get('GITHUB_CLIENT_ID') || '';
    const githubClientSecret = Deno.env.get('GITHUB_CLIENT_SECRET') || '';
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_SECRET') || 'repopilot-secret-key-32-chars-long!';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate Supabase User
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { code, state } = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing OAuth authorization code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Exchange code with GitHub
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: githubClientId,
        client_secret: githubClientSecret,
        code,
        state,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      return new Response(JSON.stringify({ error: tokenData.error_description || 'GitHub token exchange failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = tokenData.access_token;
    const scopeStr = tokenData.scope || '';
    const scopes = scopeStr.split(',').map((s: string) => s.trim()).filter(Boolean);

    // Fetch user details from GitHub
    const ghUserRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!ghUserRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to retrieve GitHub user identity' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ghUser = await ghUserRes.json();

    // Encrypt token
    const { cipherText, iv } = await encryptToken(accessToken, encryptionKey);

    // Upsert into github_connections
    const { error: dbError } = await supabase
      .from('github_connections')
      .upsert({
        user_id: user.id,
        github_user_id: String(ghUser.id),
        github_username: ghUser.login,
        github_profile_url: ghUser.html_url,
        encrypted_access_token: cipherText,
        token_iv: iv,
        token_tag: 'aes-256-gcm',
        granted_scopes: scopes,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('DB Error inserting connection:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to store GitHub connection' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log usage event
    await supabase.from('usage_events').insert({
      user_id: user.id,
      event_type: 'github_connected',
      usage_metadata: { github_username: ghUser.login, scopes },
    });

    return new Response(
      JSON.stringify({
        success: true,
        connection: {
          githubUsername: ghUser.login,
          githubProfileUrl: ghUser.html_url,
          avatarUrl: ghUser.avatar_url,
          grantedScopes: scopes,
        },
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

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase clients
const getSupabaseAdmin = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const getSupabaseClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Health check endpoint
app.get("/make-server-fb9ece0c/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize test account endpoint
app.post("/make-server-fb9ece0c/init-test", async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    const testAccounts = [
      { email: 'admin@test.com', password: '123123', name: '관리자', isAdmin: true },
      { email: 'user@test.com', password: '123123', name: '황유덕', isAdmin: false }
    ];

    const results = [];

    for (const account of testAccounts) {
      try {
        // Try to get existing user by email
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users?.find((u: any) => u.email === account.email);
        
        if (existingUser) {
          // Update password if user exists
          try {
            await supabase.auth.admin.updateUserById(existingUser.id, {
              password: account.password,
              user_metadata: { name: account.name },
              email_confirm: true
            });
            
            // Update user info in KV store
            await kv.set(`user:${existingUser.id}`, {
              id: existingUser.id,
              email: account.email,
              name: account.name,
              isAdmin: account.isAdmin,
              createdAt: existingUser.created_at
            });
            
            results.push({ email: account.email, status: 'updated' });
            continue;
          } catch (updateErr: any) {
            console.error(`Error updating ${account.email}:`, updateErr);
            results.push({ email: account.email, status: 'error', message: updateErr.message });
            continue;
          }
        }

        // Create new user if doesn't exist
        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          user_metadata: { name: account.name },
          email_confirm: true
        });

        if (error) {
          console.error(`Error creating ${account.email}:`, error);
          results.push({ email: account.email, status: 'error', message: error.message });
          continue;
        }

        if (data.user) {
          await kv.set(`user:${data.user.id}`, {
            id: data.user.id,
            email: account.email,
            name: account.name,
            isAdmin: account.isAdmin,
            createdAt: new Date().toISOString()
          });
          results.push({ email: account.email, status: 'created' });
        }
      } catch (err: any) {
        console.error(`Error processing ${account.email}:`, err);
        results.push({ email: account.email, status: 'error', message: err.message });
      }
    }

    return c.json({ message: 'Test accounts initialized', results });
  } catch (error: any) {
    console.error('Error creating test accounts:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Sign up endpoint
app.post("/make-server-fb9ece0c/signup", async (c) => {
  try {
    const { email, password, name, isAdmin } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Sign up error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user info in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      isAdmin: isAdmin || false,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      user: { 
        id: data.user.id, 
        email, 
        name,
        isAdmin: isAdmin || false
      } 
    });
  } catch (error) {
    console.log(`Sign up error: ${error}`);
    return c.json({ error: "Sign up failed" }, 500);
  }
});

// Get user info endpoint
app.get("/make-server-fb9ece0c/user", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get additional user info from KV store
    const userInfo = await kv.get(`user:${user.id}`);

    return c.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name,
      isAdmin: userInfo?.isAdmin || false
    });
  } catch (error) {
    console.log(`Get user error: ${error}`);
    return c.json({ error: "Failed to get user info" }, 500);
  }
});

// Submit survey endpoint
app.post("/make-server-fb9ece0c/submit-survey", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { responses, date, companyName, author } = await c.req.json();
    
    if (!responses || typeof responses !== 'object') {
      return c.json({ error: "Invalid survey responses" }, 400);
    }

    // Generate survey ID
    const surveyId = `${user.id}_${Date.now()}`;

    // Store survey response
    await kv.set(`survey:${surveyId}`, {
      id: surveyId,
      userId: user.id,
      responses,
      date,
      companyName,
      author,
      submittedAt: new Date().toISOString()
    });

    // Analyze survey with LLM
    const analysisResult = await analyzeSurvey(responses);

    // Store analysis result
    await kv.set(`result:${surveyId}`, {
      id: surveyId,
      userId: user.id,
      date,
      companyName,
      author,
      responses,
      ...analysisResult,
      analyzedAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      surveyId,
      result: analysisResult
    });
  } catch (error) {
    console.log(`Submit survey error: ${error}`);
    return c.json({ error: "Failed to submit survey" }, 500);
  }
});

// Analyze survey with LLM
async function analyzeSurvey(responses: Record<string, number>) {
  // Calculate category scores
  const categories = {
    '직무수행능력': [1, 2, 3, 4, 5],
    '전문성 발전': [6, 7, 8, 9, 10],
    '비판적 사고': [11, 12, 13, 14, 15],
    '협업능력': [16, 17, 18, 19, 20],
    '문제해결력': [21, 22, 23, 24, 25]
  };

  const categoryScores: Record<string, number> = {};
  
  for (const [category, questionIds] of Object.entries(categories)) {
    const scores = questionIds.map(id => responses[`q${id}`] || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    categoryScores[category] = Math.round((avgScore / 5) * 100);
  }

  // Generate LLM analysis
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  let summary = '';

  if (openaiApiKey) {
    try {
      const prompt = `다음은 직무역량 자가진단 설문조사 결과입니다:

${Object.entries(categoryScores).map(([category, score]) => 
  `${category}: ${score}점`
).join('\n')}

이 결과를 바탕으로 200-300자 정도의 총평을 작성해주세요. 강점과 개선이 필요한 부분을 포함하여 전문적이고 건설적인 피드백을 제공해주세요.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: '당신은 인사 평가 전문가입니다.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        summary = data.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.log(`LLM analysis error: ${error}`);
    }
  }

  // Default summary if LLM is not available
  if (!summary) {
    const avgScore = Object.values(categoryScores).reduce((a, b) => a + b, 0) / Object.keys(categoryScores).length;
    summary = `전반적인 직무역량 수준은 ${avgScore}점으로 평가되었습니다. `;
    
    const highest = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0];
    const lowest = Object.entries(categoryScores).sort((a, b) => a[1] - b[1])[0];
    
    summary += `특히 ${highest[0]} 영역에서 ${highest[1]}점으로 우수한 역량을 보여주고 있습니다. `;
    summary += `반면 ${lowest[0]} 영역은 ${lowest[1]}점으로 더욱 발전이 필요한 것으로 나타났습니다. `;
    summary += `지속적인 자기계발과 학습을 통해 전반적인 역량을 향상시켜 나가시기 바랍니다.`;
  }

  return {
    categoryScores,
    summary
  };
}

// Get survey result endpoint
app.get("/make-server-fb9ece0c/result/:surveyId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const surveyId = c.req.param('surveyId');
    const result = await kv.get(`result:${surveyId}`);

    if (!result) {
      return c.json({ error: "Result not found" }, 404);
    }

    // Check if user owns this survey or is admin
    const userInfo = await kv.get(`user:${user.id}`);
    if (result.userId !== user.id && !userInfo?.isAdmin) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return c.json(result);
  } catch (error) {
    console.log(`Get result error: ${error}`);
    return c.json({ error: "Failed to get result" }, 500);
  }
});

// Get all results (admin only)
app.get("/make-server-fb9ece0c/results", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const userInfo = await kv.get(`user:${user.id}`);
    if (!userInfo?.isAdmin) {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }

    // Get all results
    const results = await kv.getByPrefix('result:');

    // Enrich with user info
    const enrichedResults = await Promise.all(
      results.map(async (result: any) => {
        const userInfo = await kv.get(`user:${result.userId}`);
        return {
          ...result,
          userName: userInfo?.name || 'Unknown',
          userEmail: userInfo?.email || 'Unknown'
        };
      })
    );

    // Sort by date (newest first)
    enrichedResults.sort((a, b) => 
      new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
    );

    return c.json({ results: enrichedResults });
  } catch (error) {
    console.log(`Get all results error: ${error}`);
    return c.json({ error: "Failed to get results" }, 500);
  }
});

Deno.serve(app.fetch);
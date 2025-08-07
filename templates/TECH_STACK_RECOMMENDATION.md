# Edition Tech Stack Recommendation

## Core Stack Decision

### ✅ Frontend & Delivery

- **Next.js 14+ (App Router)** on **Vercel** - Perfect for the web reading experience
- **assistant-ui** for the SMS bot chat interface (managing preferences via text)
- **React Email** for formatting the HTML editions
- **Tailwind CSS** for styling

### ✅ AI Integration Layer

- **Vercel AI SDK v5** (when stable, v4 for now) - Unified model interface
- **Mastra** for the agentic newsroom orchestration
  - Topic Managers as Mastra agents
  - User Editors as personalized agents
  - Section selection workflows
- **OpenAI GPT-4o** for synthesis, **Claude Haiku** for filtering (cost optimization)

### ✅ Background Processing (Critical for Edition)

Given our 1-6 AM processing pipeline with multiple stages:

- **Temporal** for mission-critical orchestration
  - Demand analysis workflow
  - Parallel ingestion coordination
  - Story synthesis pipeline
  - MCP data fetching stages
  - Section generation workflow
- **Why Temporal over Inngest/Trigger.dev:**
  - Need complex DAG workflows with conditional branching
  - Must handle failures gracefully (news never stops)
  - Requires scheduling precision (exact 6 AM delivery)
  - Supports our multi-stage pipeline with checkpoints

### ✅ Data Storage

**Primary Database:**

- **Supabase** (PostgreSQL + pgvector)
  - User profiles, preferences, Active Lenses
  - Content items with vector embeddings
  - Section preferences
  - Built-in auth for user management
  - pgvector for semantic search (simpler than separate vector DB)
  - Row-level security for multi-tenancy

**Caching & Real-time:**

- **Upstash Redis** for:
  - Hot content cache (today's processed stories)
  - User state machine cache
  - MCP response caching
  - Rate limiting for API calls

**Content Storage:**

- **Supabase Storage** for:
  - Newsletter archive (Newsletter Lake)
  - Generated HTML editions
  - User-forwarded content

### ✅ Ingestion & Integration

**News Sources:**

- **NewsAPI.ai** - Primary news aggregation
- **Custom scrapers** via Playwright for specific sources
- **Email parsing** via SendGrid Inbound Parse for newsletters

**MCP Servers:**

- Build custom MCP servers using the **MCP SDK**
- Deploy on **Cloudflare Workers** for edge performance
- Integrate: OpenWeather, ESPN, Yahoo Finance, Google Calendar

### ✅ SMS Infrastructure

- **Twilio** for SMS delivery (proven at scale)
- **Twilio Conversations API** for bot interactions
- Fallback to **MessageBird** for redundancy

## Architecture Adjustments for Edition

### 1. Temporal Workflows Structure

```typescript
// Main orchestration workflow (runs nightly)
export async function editionPipeline(userId: string) {
  // 1:00 AM - Demand Analysis
  const demand = await activities.analyzeDemand();

  // 1:30 AM - Parallel Ingestion
  const sources = await Promise.all([
    activities.ingestNewsAPI(demand),
    activities.processNewsletters(demand),
    activities.scrapeSocialSources(demand),
  ]);

  // 3:00 AM - Processing & Embeddings
  const processed = await activities.processContent(sources);

  // 4:00 AM - Story Synthesis
  const synthesized = await activities.synthesizeStories(processed);

  // 4:45 AM - MCP Real-time Data
  const realTimeContext = await activities.fetchMCPData(userId);

  // 5:00 AM - Section Generation (using Mastra agents)
  const edition = await activities.generateEdition(userId, synthesized, realTimeContext);

  // 6:00 AM - Delivery
  await activities.deliverEdition(edition);
}
```

### 2. Mastra Agent Configuration

```typescript
// Topic Manager Agent
const topicManager = new Agent({
  name: 'tech-topic-manager',
  model: 'gpt-4o',
  tools: [fetchNewsAPI, searchReddit, analyzeNewsletter],
  systemPrompt: 'You manage technology news...',
});

// User Editor Agent
const userEditor = new Agent({
  name: 'user-editor',
  model: 'gpt-4o',
  tools: [selectSections, fillSection, personalizeContent],
  systemPrompt: 'You are a personal news editor...',
});
```

### 3. Section Library with Mastra Workflows

```typescript
const sectionSelectionWorkflow = new Workflow({
  name: 'section-selection',
  steps: [
    {
      id: 'get-preferences',
      type: 'action',
      action: getUserSectionPreferences,
    },
    {
      id: 'score-sections',
      type: 'agent',
      agent: sectionScoringAgent,
    },
    {
      id: 'apply-constraints',
      type: 'action',
      action: applySectionConstraints,
    },
  ],
});
```

## Development & Deployment Strategy

### Phase 1: MVP (Weeks 1-4)

1. **Setup Supabase** with schema
2. **Deploy basic Next.js** on Vercel
3. **Implement Temporal** workflows locally
4. **Build ingestion** with NewsAPI
5. **Create Mastra agents** for synthesis
6. **SMS delivery** via Twilio

### Phase 2: Enhancement (Weeks 5-8)

1. **Newsletter Lake** implementation
2. **MCP server** development
3. **Section Library** system
4. **Active Lenses** features
5. **Web reading** experience

### Phase 3: Scale (Weeks 9-12)

1. **Deploy Temporal Cloud** for production
2. **Optimize costs** with tiered processing
3. **Add monitoring** with OpenTelemetry
4. **Performance tuning**
5. **Beta user onboarding**

## Cost Optimization Strategies

### LLM Usage Tiers

```typescript
// Tier 1: Full synthesis (premium users)
const premiumSynthesis = {
  filter: 'claude-3-haiku', // $0.25/1M tokens
  synthesis: 'gpt-4o', // $5/1M tokens
  personalization: 'gpt-4o-mini', // $0.15/1M tokens
};

// Tier 2: Balanced (standard users)
const standardSynthesis = {
  filter: 'claude-3-haiku',
  synthesis: 'gpt-4o-mini',
  personalization: 'claude-3-haiku',
};

// Tier 3: Efficient (free tier)
const efficientSynthesis = {
  filter: 'claude-3-haiku',
  synthesis: 'claude-3-haiku',
  personalization: 'cached-templates',
};
```

### Caching Strategy

- Cache synthesized stories for 6 hours
- Share common content across users
- Pre-compute embeddings nightly
- Cache MCP responses for 15 minutes

## Monitoring & Observability

### Key Metrics Dashboard

- **Helicone** for LLM cost tracking
- **Temporal UI** for workflow monitoring
- **Vercel Analytics** for web performance
- **Custom dashboard** for:
  - Delivery success rate
  - Cost per edition
  - User engagement metrics
  - Section performance

## Why This Stack for Edition

### Strengths

1. **Temporal handles complex orchestration** - Perfect for our time-sensitive pipeline
2. **Supabase provides everything** - Auth, DB, vectors, storage in one
3. **Mastra simplifies agents** - Clean TypeScript for our newsroom model
4. **Vercel/Next.js proven** - Fast web experience with zero ops
5. **Cost-effective scaling** - Free tiers support MVP, pay-as-you-grow

### Trade-offs

1. **Temporal adds complexity** - But necessary for reliability
2. **Multiple services** - But each best-in-class for its purpose
3. **Learning curve** - But all have excellent TypeScript support

## Migration Path

If starting simpler:

1. **Start with Inngest** instead of Temporal for first 100 users
2. **Use OpenAI only** (skip multi-model optimization initially)
3. **Skip MCP servers** initially (add weather/sports later)
4. **Launch with 10 sections** (expand library over time)

Then migrate to full stack as you scale.

## Final Recommendation

✅ **GO WITH THIS STACK** - It perfectly balances:

- Production reliability (Temporal, Supabase)
- Developer velocity (TypeScript throughout, Mastra)
- Cost efficiency (smart tier system, caching)
- Scalability (can handle 100K+ users)

The only adjustment from your suggestions: **strongly prefer Temporal over Inngest** for Edition's specific needs. The complexity of our multi-stage pipeline with precise timing requirements justifies the additional operational overhead.

## Next Steps

1. **Set up Supabase project** (immediate)
2. **Initialize Next.js with Vercel** (immediate)
3. **Design Temporal workflows** (week 1)
4. **Build first Mastra agents** (week 2)
5. **Implement NewsAPI ingestion** (week 2)
6. **Create MVP delivery system** (week 3)
7. **Beta test with 10 users** (week 4)

This stack will take Edition from prototype to 100K+ users without major rewrites.

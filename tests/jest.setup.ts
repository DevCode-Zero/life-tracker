process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.NEXT_PUBLIC_OPENROUTER_API_KEY = "test-api-key";

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => ({
                single: jest.fn(() => ({ data: null, error: null })),
                data: [],
                error: null,
              })),
              data: [],
              error: null,
            })),
            data: [],
            error: null,
          })),
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: null })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({ data: null, error: null })),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({ data: null, error: null })),
        })),
        upsert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: null })),
          })),
        })),
        maybeSingle: jest.fn(() => ({ data: null, error: null })),
        ilike: jest.fn(() => ({
          maybeSingle: jest.fn(() => ({ data: null, error: null })),
        })),
      })),
      auth: {
        getSession: jest.fn(() => ({ data: { session: null } })),
        signOut: jest.fn(),
      },
    })),
  })),
}));

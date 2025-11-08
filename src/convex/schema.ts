import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const PLAN_TYPES = {
  FREE: "free",
  STARTER: "starter",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export const planTypeValidator = v.union(
  v.literal(PLAN_TYPES.FREE),
  v.literal(PLAN_TYPES.STARTER),
  v.literal(PLAN_TYPES.PRO),
  v.literal(PLAN_TYPES.ENTERPRISE),
);

export const INTEGRATION_TYPES = {
  INSTAGRAM: "instagram",
  WHATSAPP: "whatsapp",
} as const;

export const integrationTypeValidator = v.union(
  v.literal(INTEGRATION_TYPES.INSTAGRAM),
  v.literal(INTEGRATION_TYPES.WHATSAPP),
);

export const FLOW_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
  DRAFT: "draft",
} as const;

export const flowStatusValidator = v.union(
  v.literal(FLOW_STATUS.ACTIVE),
  v.literal(FLOW_STATUS.PAUSED),
  v.literal(FLOW_STATUS.DRAFT),
);

export const TRIGGER_TYPES = {
  INSTAGRAM_COMMENT: "instagram_comment",
  INSTAGRAM_DM: "instagram_dm",
  INSTAGRAM_STORY_MENTION: "instagram_story_mention",
  INSTAGRAM_STORY_REPLY: "instagram_story_reply",
  WHATSAPP_MESSAGE: "whatsapp_message",
  KEYWORD: "keyword",
  SCHEDULE: "schedule",
} as const;

export const triggerTypeValidator = v.union(
  v.literal(TRIGGER_TYPES.INSTAGRAM_COMMENT),
  v.literal(TRIGGER_TYPES.INSTAGRAM_DM),
  v.literal(TRIGGER_TYPES.INSTAGRAM_STORY_MENTION),
  v.literal(TRIGGER_TYPES.INSTAGRAM_STORY_REPLY),
  v.literal(TRIGGER_TYPES.WHATSAPP_MESSAGE),
  v.literal(TRIGGER_TYPES.KEYWORD),
  v.literal(TRIGGER_TYPES.SCHEDULE),
);

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      
      // Subscription info
      planType: v.optional(planTypeValidator),
      planStartDate: v.optional(v.number()),
      planEndDate: v.optional(v.number()),
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
      
      // Usage tracking
      messagesUsedToday: v.optional(v.number()),
      lastResetDate: v.optional(v.string()),
    }).index("email", ["email"]),

    // Social media integrations
    integrations: defineTable({
      userId: v.id("users"),
      type: integrationTypeValidator,
      
      // Meta OAuth tokens
      accessToken: v.string(), // Encrypted
      refreshToken: v.optional(v.string()),
      expiresAt: v.optional(v.number()),
      
      // Platform-specific IDs
      platformUserId: v.string(),
      platformUsername: v.optional(v.string()),
      
      // WhatsApp specific
      phoneNumberId: v.optional(v.string()),
      businessAccountId: v.optional(v.string()),
      
      isActive: v.boolean(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_type", ["userId", "type"]),

    // Automation flows
    flows: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      status: flowStatusValidator,
      
      // Flow configuration (JSON structure)
      trigger: v.object({
        type: triggerTypeValidator,
        keywords: v.optional(v.array(v.string())),
        conditions: v.optional(v.any()),
        postId: v.optional(v.string()), // For specific post triggers
        scheduleTime: v.optional(v.string()), // For scheduled flows
      }),
      
      actions: v.array(v.object({
        type: v.string(), // "send_dm", "send_reply", "delay", "condition", "http_call", "add_tag", "send_product", "collect_email", "send_broadcast", "add_to_sequence"
        config: v.any(),
      })),
      
      // Statistics
      totalExecutions: v.optional(v.number()),
      successfulExecutions: v.optional(v.number()),
      failedExecutions: v.optional(v.number()),
      lastExecutedAt: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_status", ["userId", "status"]),

    // Broadcast campaigns
    broadcasts: defineTable({
      userId: v.id("users"),
      name: v.string(),
      message: v.string(),
      platform: integrationTypeValidator,
      
      // Targeting
      targetAudience: v.optional(v.object({
        tags: v.optional(v.array(v.string())),
        segments: v.optional(v.array(v.string())),
        excludeTags: v.optional(v.array(v.string())),
      })),
      
      // Scheduling
      scheduledFor: v.optional(v.number()),
      status: v.union(
        v.literal("draft"),
        v.literal("scheduled"),
        v.literal("sending"),
        v.literal("completed"),
        v.literal("failed")
      ),
      
      // Stats
      totalRecipients: v.optional(v.number()),
      sentCount: v.optional(v.number()),
      deliveredCount: v.optional(v.number()),
      failedCount: v.optional(v.number()),
      openedCount: v.optional(v.number()),
      clickedCount: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_status", ["userId", "status"]),

    // Contact tags and segments
    contacts: defineTable({
      userId: v.id("users"),
      platform: integrationTypeValidator,
      platformUserId: v.string(),
      username: v.optional(v.string()),
      
      // Contact info
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      
      // Segmentation
      tags: v.array(v.string()),
      customFields: v.optional(v.any()),
      
      // Engagement
      lastInteractionAt: v.optional(v.number()),
      totalMessages: v.optional(v.number()),
      isSubscribed: v.optional(v.boolean()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_platform", ["userId", "platform"])
      .index("by_platform_user", ["platformUserId"]),

    // Sequences (drip campaigns)
    sequences: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      status: flowStatusValidator,
      
      steps: v.array(v.object({
        delay: v.number(), // Delay in hours from previous step
        message: v.string(),
        mediaUrl: v.optional(v.string()),
        buttons: v.optional(v.array(v.object({
          text: v.string(),
          action: v.string(),
        }))),
      })),
      
      // Stats
      totalSubscribers: v.optional(v.number()),
      activeSubscribers: v.optional(v.number()),
      completedSubscribers: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_status", ["userId", "status"]),

    // Sequence subscriptions
    sequenceSubscriptions: defineTable({
      sequenceId: v.id("sequences"),
      contactId: v.id("contacts"),
      currentStep: v.number(),
      status: v.union(
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed"),
        v.literal("unsubscribed")
      ),
      nextStepAt: v.optional(v.number()),
    })
      .index("by_sequence", ["sequenceId"])
      .index("by_contact", ["contactId"])
      .index("by_next_step", ["nextStepAt"]),

    // Product catalog
    products: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      tags: v.array(v.string()),
      sku: v.optional(v.string()),
      inStock: v.optional(v.boolean()),
    })
      .index("by_user", ["userId"])
      .searchIndex("search_products", {
        searchField: "name",
        filterFields: ["userId", "tags"],
      }),

    // Message logs
    messages: defineTable({
      userId: v.id("users"),
      flowId: v.optional(v.id("flows")),
      
      platform: integrationTypeValidator,
      direction: v.union(v.literal("inbound"), v.literal("outbound")),
      
      // Recipient info
      recipientId: v.string(),
      recipientUsername: v.optional(v.string()),
      
      // Message content
      messageType: v.string(), // "text", "image", "template"
      content: v.string(),
      mediaUrl: v.optional(v.string()),
      
      // Status
      status: v.union(
        v.literal("queued"),
        v.literal("sent"),
        v.literal("delivered"),
        v.literal("failed"),
        v.literal("read")
      ),
      errorMessage: v.optional(v.string()),
      
      // Metadata
      postId: v.optional(v.string()),
      commentId: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_flow", ["userId", "flowId"])
      .index("by_user_and_platform", ["userId", "platform"]),

    // Analytics aggregations
    analytics: defineTable({
      userId: v.id("users"),
      date: v.string(), // YYYY-MM-DD
      
      // Message counts
      totalMessages: v.number(),
      sentMessages: v.number(),
      deliveredMessages: v.number(),
      failedMessages: v.number(),
      
      // By platform
      instagramMessages: v.number(),
      whatsappMessages: v.number(),
      
      // Flow executions
      flowExecutions: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_date", ["userId", "date"]),

    // Webhook events (for debugging)
    webhookEvents: defineTable({
      userId: v.optional(v.id("users")),
      platform: integrationTypeValidator,
      eventType: v.string(),
      payload: v.any(),
      processed: v.boolean(),
      processedAt: v.optional(v.number()),
      errorMessage: v.optional(v.string()),
    })
      .index("by_processed", ["processed"])
      .index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
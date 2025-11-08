"use node";

import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const fetchUserMedia = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<any> => {
    // Get Instagram integration
    const integration: any = await ctx.runQuery(internal.integrations.getByType, {
      type: "instagram",
    });
    
    if (!integration) {
      throw new Error("Instagram not connected");
    }
    
    try {
      // Fetch user's media from Instagram Graph API
      const response: Response = await fetch(
        `https://graph.facebook.com/v18.0/${integration.platformUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${integration.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${await response.text()}`);
      }
      
      const data: any = await response.json();
      
      // Filter for reels only
      const reels: any[] = data.data.filter((media: any) => 
        media.media_type === "VIDEO" || media.media_type === "REELS"
      );
      
      // Store or update media in database
      for (const reel of reels) {
        await ctx.runMutation(internal.instagram.upsertMedia, {
          userId: args.userId,
          mediaId: reel.id,
          caption: reel.caption || "",
          mediaType: reel.media_type,
          mediaUrl: reel.media_url,
          thumbnailUrl: reel.thumbnail_url,
          permalink: reel.permalink,
          timestamp: reel.timestamp,
          likeCount: reel.like_count || 0,
          commentsCount: reel.comments_count || 0,
        });
      }
      
      return reels;
    } catch (error) {
      console.error("Error fetching Instagram media:", error);
      throw error;
    }
  },
});

export const upsertMedia = internalMutation({
  args: {
    userId: v.id("users"),
    mediaId: v.string(),
    caption: v.string(),
    mediaType: v.string(),
    mediaUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    permalink: v.string(),
    timestamp: v.string(),
    likeCount: v.number(),
    commentsCount: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if media already exists
    const existing = await ctx.db
      .query("instagramMedia")
      .withIndex("by_media_id", (q) => q.eq("mediaId", args.mediaId))
      .first();
    
    if (existing) {
      // Update existing media
      await ctx.db.patch(existing._id, {
        caption: args.caption,
        likeCount: args.likeCount,
        commentsCount: args.commentsCount,
        lastFetched: Date.now(),
      });
      return existing._id;
    }
    
    // Insert new media
    return await ctx.db.insert("instagramMedia", {
      userId: args.userId,
      mediaId: args.mediaId,
      caption: args.caption,
      mediaType: args.mediaType,
      mediaUrl: args.mediaUrl,
      thumbnailUrl: args.thumbnailUrl,
      permalink: args.permalink,
      timestamp: args.timestamp,
      likeCount: args.likeCount,
      commentsCount: args.commentsCount,
      lastFetched: Date.now(),
    });
  },
});

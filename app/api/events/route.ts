import { NextRequest, NextResponse } from "next/server";
import { getEventBus } from "@/lib/events/event-bus";
import { getEventQueue } from "@/lib/events/queue";
import { EventType } from "@/types/events";

/**
 * GET /api/events
 * Get event history and queue stats
 */
export async function GET(request: NextRequest) {
  try {
    const eventBus = getEventBus();
    const eventQueue = getEventQueue();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");

    const history = eventBus.getHistory({
      eventType: type as EventType | undefined,
      limit,
    });

    const queueStats = eventQueue.getStats();

    return NextResponse.json({
      success: true,
      data: {
        history,
        queueStats,
        subscriptions: eventBus.getSubscriptions().length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EVENT_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Publish a new event
 */
export async function POST(request: NextRequest) {
  try {
    const eventBus = getEventBus();
    const body = await request.json();
    const { type, payload, source } = body;

    if (!type || !payload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "type and payload are required",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const event = eventBus.createEvent(type, payload, source || "api");
    await eventBus.publish(event);

    return NextResponse.json({
      success: true,
      data: event,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EVENT_PUBLISH_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


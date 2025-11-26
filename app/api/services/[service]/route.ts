import { NextRequest, NextResponse } from "next/server";
import { getAllServiceClients } from "@/lib/services";

type ServiceKey = keyof ReturnType<typeof getAllServiceClients>;

const serviceMapping: Record<string, ServiceKey> = {
  "h2r-employees": "h2rEmployees",
  "h2r-requisitions": "h2rRequisitions",
  "lms-courses": "lmsCourses",
  "lms-enrollments": "lmsEnrollments",
  "wfm-shifts": "wfmShifts",
  "wfm-attendance": "wfmAttendance",
  tickets: "tickets",
  kpis: "kpis",
  "performance-metrics": "performanceMetrics",
  "quality-assessments": "qualityAssessments",
  "skill-gaps": "skillGaps",
};

/**
 * GET /api/services/[service]
 * Get data from a specific service
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  try {
    const { service } = await params;
    const clients = getAllServiceClients();
    const clientKey = serviceMapping[service];

    if (!clientKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SERVICE",
            message: `Invalid service: ${service}. Valid services: ${Object.keys(serviceMapping).join(", ")}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const client = clients[clientKey];
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const result = await client.getById(id);
      return NextResponse.json({
        success: result.success,
        data: result.data,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const result = await client.getAll({
      pagination: { page, pageSize },
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVICE_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services/[service]
 * Create a new entity in a service
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  try {
    const { service } = await params;
    const clients = getAllServiceClients();
    const clientKey = serviceMapping[service];

    if (!clientKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SERVICE",
            message: `Invalid service: ${service}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const client = clients[clientKey];
    const body = await request.json();

    const result = await client.create(body);

    return NextResponse.json({
      success: result.success,
      data: result.data,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVICE_CREATE_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/services/[service]
 * Update an entity in a service
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  try {
    const { service } = await params;
    const clients = getAllServiceClients();
    const clientKey = serviceMapping[service];

    if (!clientKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SERVICE",
            message: `Invalid service: ${service}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const client = clients[clientKey];
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "id is required for update",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const result = await client.update(id, data);

    return NextResponse.json({
      success: result.success,
      data: result.data,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVICE_UPDATE_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services/[service]
 * Delete an entity from a service
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  try {
    const { service } = await params;
    const clients = getAllServiceClients();
    const clientKey = serviceMapping[service];

    if (!clientKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SERVICE",
            message: `Invalid service: ${service}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const client = clients[clientKey];
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "id is required for delete",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const result = await client.delete(id);

    return NextResponse.json({
      success: result.success,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVICE_DELETE_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


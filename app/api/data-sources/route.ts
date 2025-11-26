import { NextRequest, NextResponse } from "next/server";
import {
  getAllDataSourceConfigs,
  getDataSourceConfig,
  updateDataSourceConfig,
  setDataSourceType,
  ServiceId,
} from "@/lib/data-sources/config";

/**
 * GET /api/data-sources
 * Get all data source configurations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("service") as ServiceId | null;

    if (serviceId) {
      const config = getDataSourceConfig(serviceId);
      return NextResponse.json({
        success: true,
        data: config,
        timestamp: new Date().toISOString(),
      });
    }

    const configs = getAllDataSourceConfigs();
    return NextResponse.json({
      success: true,
      data: configs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATA_SOURCE_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/data-sources
 * Update a data source configuration
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, type, ...updates } = body;

    if (!serviceId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "serviceId is required",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Update type if provided
    if (type) {
      setDataSourceType(serviceId, type);
    }

    // Update other configuration
    if (Object.keys(updates).length > 0) {
      updateDataSourceConfig(serviceId, updates);
    }

    const config = getDataSourceConfig(serviceId);

    return NextResponse.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATA_SOURCE_UPDATE_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


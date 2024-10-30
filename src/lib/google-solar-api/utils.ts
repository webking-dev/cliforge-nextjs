import { BuildingInsightsCondensed, BuildingInsightsResponse } from '@/types';

export function cleanUpInsights(insights: BuildingInsightsResponse) {
    delete insights.solarPotential.wholeRoofStats.sunshineQuantiles;
    delete insights.imageryProcessedDate;
    delete insights.solarPotential.wholeRoofStats.sunshineQuantiles;
    delete insights.solarPotential.roofSegmentStats;
    if (
        insights.solarPotential.solarPanelConfigs &&
        insights.solarPotential.solarPanelConfigs.length
    )
        for (const config of insights.solarPotential.solarPanelConfigs)
            delete config.roofSegmentSummaries;
    else delete insights.solarPotential.solarPanelConfigs;
    delete insights.solarPotential.financialAnalyses;
    delete insights.solarPotential.panelCapacityWatts;
    delete insights.solarPotential.panelHeightMeters;
    delete insights.solarPotential.panelWidthMeters;
    delete insights.solarPotential.panelLifetimeYears;
    delete insights.solarPotential.buildingStats;
    delete insights.solarPotential.solarPanels;
    delete insights.boundingBox;
    delete insights.postalCode;
    delete insights.administrativeArea;
    delete insights.statisticalArea;
    delete insights.regionCode;
}

export function condenseBuildingInsights(insights: BuildingInsightsResponse) {
    return {
        id: insights.name,
        streetAddress: insights.streetAddress.line1,
        wholeRoofArea: insights.solarPotential.wholeRoofStats.areaMeters2,
        maxSunshineHours: insights.solarPotential.maxSunshineHoursPerYear,
        maxArrayArea: insights.solarPotential.maxArrayAreaMeters2,
        maxPanelCount: insights.solarPotential.maxArrayPanelsCount,
        carbonOffsetFactor: insights.solarPotential.carbonOffsetFactorKgPerMwh,
    } as BuildingInsightsCondensed;
}

import { BuildingInsight, BuildingInsightsResponse } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

type BuildingListProps = {
    data?: BuildingInsightsResponse[];
    onSelect: (building: BuildingInsight) => void;
};

export default function BuildingList(props: BuildingListProps) {
    const [buildingInsights, setBuildingInsights] = useState<BuildingInsight[]>(
        []
    );

    useEffect(() => {
        if (!props.data) return;

        const insights = props.data.map((building) => {
            const imageryDate = `${building.imageryDate.day}/${building.imageryDate.month}/${building.imageryDate.year}`;
            const roofSize =
                building.solarPotential.wholeRoofStats.areaMeters2.toFixed(2);
            const maxPanelCount = building.solarPotential.maxArrayPanelsCount;
            const maxArrayArea =
                building.solarPotential.maxArrayAreaMeters2.toFixed(2);
            const maxSunshineHours =
                building.solarPotential.maxSunshineHoursPerYear.toFixed(2);

            return {
                name: building.name,
                address: building.streetAddress,
                imageryDate,
                roofSize,
                maxPanelCount,
                maxArrayArea,
                maxSunshineHours,
                rawData: building,
            };
        });

        setBuildingInsights(insights);
    }, [props.data]);

    return (
        <ScrollArea className="h-full w-full">
            <div className="space-y-4 px-4">
                <AnimatePresence mode="popLayout">
                    {buildingInsights.length ? (
                        buildingInsights.map((b) => (
                            <motion.div
                                key={b.name}
                                className="border-white border-4 border-opacity-30 rounded-xl px-4 py-2 bg-white bg-opacity-60 space-y-2"
                                onClick={() => props.onSelect(b)}
                                layout
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.6, type: 'spring' }}
                            >
                                <h4 className="text-lg font-semibold">
                                    {b.address.line1}
                                </h4>
                                <div className="flex flex-wrap flex-row gap-2">
                                    <Badge variant="secondary">
                                        Roof Size: {b.roofSize}m²
                                    </Badge>
                                    <Badge variant="secondary">
                                        Max Panel Count: {b.maxPanelCount}
                                    </Badge>
                                    <Badge variant="secondary">
                                        Sunshine Hours: {b.maxSunshineHours}h
                                    </Badge>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <p className="px-4">
                            Building Insights not available for this location.
                        </p>
                    )}
                </AnimatePresence>
            </div>
        </ScrollArea>
    );
}

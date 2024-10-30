import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { BuildingInsightsResponse } from "@/types";

type Props = {
	data?: BuildingInsightsResponse;
};

export default function BuildingInsightsTable(props: Props) {
	const data = props.data;
	if (!data) return <p>No Building Insights Available</p>;

	const imageryDate = `${data.imageryDate.day}/${data.imageryDate.month}/${data.imageryDate.year}`;
	const roofSize = data.solarPotential.wholeRoofStats.areaMeters2.toFixed(2);
	const maxPanelCount = data.solarPotential.maxArrayPanelsCount;
	const maxArrayArea = data.solarPotential.maxArrayAreaMeters2.toFixed(2);
	const maxSunshineHours =
		data.solarPotential.maxSunshineHoursPerYear.toFixed(2);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableCell colSpan={2} className="font-bold text-center text-lg">
						Building Solar Insights
					</TableCell>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell className="font-medium">Imagery Date</TableCell>
					<TableCell className="text-right">{imageryDate}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Roof Size (meter sq.)</TableCell>
					<TableCell className="text-right">{roofSize}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Max Array Panels</TableCell>
					<TableCell className="text-right">{maxPanelCount}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">
						Max Array Area (meter sq.)
					</TableCell>
					<TableCell className="text-right">{maxArrayArea}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">
						Max Sunshine hours (per year)
					</TableCell>
					<TableCell className="text-right">{maxSunshineHours}</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}

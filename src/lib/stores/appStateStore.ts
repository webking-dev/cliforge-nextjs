import { create } from "zustand";
import { LatLng } from "@/types";

interface AppState {
	isHeaderExpanded: boolean;
	setHeaderExpanded: (expanded: boolean) => void;
	proximityCenter: LatLng | undefined;
	setProximityCenter: (center: LatLng) => void;
}

const useAppStateStore = create<AppState>()((set) => ({
	isHeaderExpanded: true,
	setHeaderExpanded: (expanded: boolean) => set({ isHeaderExpanded: expanded }),
	proximityCenter: undefined as LatLng | undefined,
	setProximityCenter: (center: LatLng) => set({ proximityCenter: center }),
}));

export default useAppStateStore;

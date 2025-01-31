export interface BottomSheetProps {
    activeHeight: number;
    children: React.ReactNode;
    backgroundColor?: string;
    backDropColor?: string;
}
export interface BottomSheetHandle {
    openSheet: () => void;
    closeSheet: () => void;
}

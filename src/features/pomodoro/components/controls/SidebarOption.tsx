import type { ReactNode } from "react";


type SidebarOptionProps = {
    label: string;
    onClick: () => void;
    icon: ReactNode
    isSelected: boolean;
};

function SidebarOption({ label, onClick, icon, isSelected }: SidebarOptionProps) {
    const colors = isSelected
    ? "bg-[#355A86] text-white hover:bg-[#3F6293]"
    : "bg-transparent text-slate-200 hover:bg-[#2D527D] hover:text-white";
    return (
        <li>
            <a onClick={onClick}
            aria-current={isSelected ? "page" : undefined}
            className="
            font-[Epilogue]
            text-lg
            flex
            items-center
            gap-3
            transition-colors duration-150
            ${colors}
            ">
            <span className="shrink-0 text-x1" aria-hidden="true">
                {icon}
            </span>

            <span>{label}</span>
            </a>
        </li>
    );
}

export default SidebarOption;
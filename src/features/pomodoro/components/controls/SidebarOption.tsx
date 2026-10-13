import type { ReactNode } from "react";


type SidebarOptionProps = {
    label: string;
    onClick: () => void;
    icon: ReactNode;
};

function SidebarOption({ label, onClick, icon, }: SidebarOptionProps) {
    return (
        <li>
            <a onClick={onClick}
            className="
            font-[Epilogue]
            text-lg
            flex
            items-center
            gap-3
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
import type { ReactNode } from "react";
import "./Layout.css";


interface LayoutProps {
    sidebarContent?: ReactNode;
    children: ReactNode;
}


export const Layout = ({ sidebarContent, children }: LayoutProps) => {
    return (
        <div className="layout">
            <aside className="sidebar">
                <h1 className="sidebar-title">Gomoku</h1>
                <p className="sidebar-subtitle">Get 5 in a row to win</p>
                <div className="sidebar-divider" />
                {sidebarContent}
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

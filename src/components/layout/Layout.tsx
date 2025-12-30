import type { ReactNode } from "react";
import "./Layout.css";


interface LayoutProps {
    children: ReactNode;
    sidebarContent?: ReactNode;
    headerContent?: ReactNode;
}


export const Layout = ({ children, sidebarContent, headerContent}: LayoutProps) => {
    return (
        <div className="layout">
            {/* header */}
            <header className="layout-header">
                <div className="header-brand">
                    <h1 className="header-title">Gomoku</h1>
                    <span className="header-subtitle">GET 5 IN A ROW TO WIN</span>
                </div>
                {headerContent && (
                    <div className="header-right">
                        {headerContent}
                    </div>
                )}
            </header>

            {/* layout body */}
            <div className="layout-body">
                {/* Sidebar */}
                {sidebarContent && (
                    <aside className="layout-sidebar">
                        {sidebarContent}
                    </aside>
                )}
                {/* main content */}
                <main className="layout-main">
                    {children}
                </main>
            </div>
        </div>
    );
};

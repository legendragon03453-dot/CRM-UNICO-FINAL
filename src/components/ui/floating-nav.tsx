"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Users, Columns, MessageSquare, Calendar, ListTodo, Settings, ShieldCheck, Target, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

interface FloatingNavProps {
  isAdmin?: boolean;
}

const FloatingNav = ({ isAdmin }: FloatingNavProps) => {
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  const items = [
    { id: 0, icon: <Home size={20} />, label: "Painel", path: "/" },
    { id: 1, icon: <Users size={20} />, label: "Leads", path: "/leads" },
    { id: 2, icon: <Columns size={20} />, label: "Pipeline", path: "/kanban" },
    { id: 3, icon: <MessageSquare size={20} />, label: "Follow-up", path: "/follow-up" },
    { id: 4, icon: <ListTodo size={20} />, label: "Tasks", path: "/tasks" },
    { id: 5, icon: <Calendar size={20} />, label: "Agenda", path: "/appointments" },
    ...(isAdmin ? [
      { id: 6, icon: <ShieldCheck size={20} />, label: "Admin", path: "/admin" },
      { id: 7, icon: <Target size={20} />, label: "Gestão", path: "/admin/management" }
    ] : []),
    { id: 8, icon: <Settings size={20} />, label: "Ajustes", path: "/settings" },
  ];

  const activeIndex = items.findIndex(item =>
    location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path))
  );

  useEffect(() => {
    const updateIndicator = () => {
      if (activeIndex !== -1 && btnRefs.current[activeIndex] && containerRef.current) {
        const btn = btnRefs.current[activeIndex];
        const container = containerRef.current;
        if (!btn) return;
        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setIndicatorStyle({
          width: btnRect.width,
          left: btnRect.left - containerRect.left,
        });
      }
    };

    updateIndicator();
    // Add a small delay to ensure refs are populated after route change
    const timer = setTimeout(updateIndicator, 50);
    window.addEventListener("resize", updateIndicator);
    return () => {
      window.removeEventListener("resize", updateIndicator);
      clearTimeout(timer);
    };
  }, [activeIndex, location.pathname]);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-5xl px-4">
      <div
        ref={containerRef}
        className="relative flex items-center justify-between bg-black shadow-2xl rounded-none px-4 py-2 border border-white/5"
      >
        {items.map((item, index) => (
          <Link
            key={item.id}
            to={item.path}
            ref={(el: any) => (btnRefs.current[index] = el)}
            className="relative flex flex-col items-center justify-center flex-1 px-1 py-3 text-sm font-medium transition-colors duration-300 group"
          >
            <div className={`z-10 transition-all duration-300 ${activeIndex === index ? 'text-white scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}>
              {item.icon}
            </div>
            <span className={`text-[8px] mt-1.5 hidden lg:block z-10 transition-colors duration-300 font-black uppercase tracking-widest ${activeIndex === index ? 'text-white' : 'text-zinc-800 group-hover:text-zinc-600'}`}>
              {item.label}
            </span>
          </Link>
        ))}

        <div className="w-[1px] h-8 bg-white/5 mx-2"></div>

        <button
          onClick={() => supabase.auth.signOut()}
          className="relative flex flex-col items-center justify-center px-4 py-3 text-zinc-600 hover:text-red-500 transition-all duration-300 group"
        >
          <LogOut size={20} className="z-10 group-hover:rotate-12 transition-transform" />
          <span className="text-[8px] mt-1.5 hidden lg:block z-10 font-black uppercase tracking-widest text-zinc-800 group-hover:text-red-900">SAIR</span>
        </button>

        {/* Sliding Active Indicator */}
        {activeIndex !== -1 && (
          <motion.div
            animate={indicatorStyle}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-1 bottom-1 rounded-full bg-white/5"
          />
        )}
      </div>
    </div>
  );
};

export default FloatingNav;

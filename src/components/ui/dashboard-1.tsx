import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Filter, Users, Clock, Zap, ArrowRight, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sub-component for animating numbers
const AnimatedNumber = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest: number) => Math.round(latest * 10) / 10);

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

// Main Component
export const MarketingDashboard = React.forwardRef<
  HTMLDivElement,
  {
    title?: string;
    teamActivities: { totalHours: number; stats: any[] };
    team: { memberCount: number; members: any[] };
    cta: { text: string; buttonText: string; onButtonClick: () => void };
    onFilterClick?: () => void;
    className?: string;
  }
>(({ 
  title = "Painel Studio",
  teamActivities,
  team,
  cta,
  onFilterClick,
  className 
}, ref) => {
  
  const springTransition = { type: 'spring' as const, stiffness: 400, damping: 30 };
  const hoverTransition = { type: 'spring' as const, stiffness: 400, damping: 30 };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };


  return (
    <motion.div
      ref={ref}
      className={cn("w-full bg-[#14130E] text-white p-2 md:p-8 space-y-8", className)}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <h2 className="text-5xl font-black italic tracking-tighter uppercase">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onFilterClick} className="border border-white/5 hover:bg-white/5 active:scale-95 transition-all">
          <Filter className="w-5 h-5 text-zinc-500" />
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Activities Card */}
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={hoverTransition}>
          <Card className="h-full bg-[#1C1B16] border-[#2A2922] p-8 rounded-none shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-0 space-y-12">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-zinc-600 tracking-[0.5em] uppercase">MÉTRICAS ATIVAS</p>
                <div className="p-3 bg-white/5 border border-white/5 rounded-none text-zinc-500"><Clock size={20} /></div>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-8xl font-black text-white italic tracking-tighter">
                  <AnimatedNumber value={teamActivities.totalHours} />
                </span>
                <span className="text-sm font-black text-zinc-700 tracking-widest uppercase">HORAS STUDIO</span>
              </div>
              {/* Progress Bar */}
              <div className="space-y-6">
                <div className="w-full h-1 bg-zinc-900 rounded-none flex overflow-hidden">
                    {teamActivities.stats.map((stat: any, index: number) => (
                    <motion.div
                        key={index}
                        className={stat.color}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                    ))}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-6">
                    {teamActivities.stats.map((stat: any) => (
                    <div key={stat.label} className="flex items-center gap-2">
                        <span className={cn("w-1.5 h-1.5 rounded-full", stat.color)}></span>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Members Card */}
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={hoverTransition}>
          <Card className="h-full bg-[#1C1B16] border-[#2A2922] p-8 rounded-none shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-0 space-y-12">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-zinc-600 tracking-[0.5em] uppercase">MEMBROS ELITE</p>
                <div className="p-3 bg-white/5 border border-white/5 rounded-none text-zinc-500"><Users size={20} /></div>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-8xl font-black text-white italic tracking-tighter">
                   <AnimatedNumber value={team.memberCount} />
                </span>
                <span className="text-sm font-black text-zinc-700 tracking-widest uppercase">OPERADORES</span>
              </div>
              {/* Avatar Stack */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-4">
                    {team.members.slice(0, 6).map((member: any, index: number) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.2, zIndex: 10, y: -5 }}
                    >
                        <Avatar className="w-16 h-16 border-4 border-[#14130E] rounded-none bg-black">
                        <AvatarImage src={member.avatarUrl} alt={member.name} className="grayscale hover:grayscale-0 transition-all" />
                        <AvatarFallback className="bg-zinc-900 text-[10px] font-black text-white italic">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </motion.div>
                    ))}
                </div>
                <div className="flex items-center gap-4 text-zinc-700 group-hover:text-white transition-all cursor-pointer">
                    <span className="text-[10px] font-black tracking-widest uppercase">SINCRONIZAR TIME</span>
                    <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CTA Banner */}
      <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} transition={hoverTransition}>
         <div className="flex items-center justify-between p-10 bg-[#1C1B16] border border-[#2A2922] shadow-2xl group cursor-pointer">
            <div className="flex items-center gap-8">
              <div className="p-5 bg-white text-black group-hover:scale-110 transition-all shadow-xl">
                  <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-zinc-600 tracking-[0.5em] uppercase">CENTRAL DE COMANDO</p>
                 <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">{cta.text}</h4>
              </div>
            </div>
            <button onClick={cta.onButtonClick} className="bg-white text-black px-12 py-5 text-[10px] font-black uppercase tracking-[0.8em] flex items-center gap-4 group-hover:bg-zinc-200 transition-all active:scale-95 shadow-xl">
                {cta.buttonText}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
         </div>
      </motion.div>
    </motion.div>
  );
});

MarketingDashboard.displayName = "MarketingDashboard";

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSchoolStore, UserRole } from '@/store/useSchoolStore';
import { useToast } from '@/components/ui/Toast';
import {
  GraduationCap,
  Users,
  Clock,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Home,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  Activity,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Sun,
  Moon,
  Zap,
  Globe,
  Check,
  UserCheck
} from 'lucide-react';

interface LayoutWrapperProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ROLE_CONFIG: Record<UserRole, {
  name: string;
  title: string;
  initials: string;
  gradient: string;
  accent: string;
}> = {
  Principal: {
    name: 'Dr. Aarav Sen',
    title: 'Executive Principal',
    initials: 'AS',
    gradient: 'from-indigo-500 to-violet-600',
    accent: 'text-indigo-600 dark:text-indigo-400'
  },
  Admin: {
    name: 'Mrs. Priya Iyer',
    title: 'Head Coordinator',
    initials: 'PI',
    gradient: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-600 dark:text-emerald-400'
  },
  Teacher: {
    name: 'Dr. Amit Sharma',
    title: 'Sr. Class Teacher · Mathematics',
    initials: 'AS',
    gradient: 'from-violet-500 to-purple-700',
    accent: 'text-violet-600 dark:text-violet-400'
  },
  Parent: {
    name: 'Mr. Sanjay Sharma',
    title: 'Parent Account',
    initials: 'SS',
    gradient: 'from-amber-500 to-orange-600',
    accent: 'text-amber-600 dark:text-amber-400'
  },
  Student: {
    name: 'Aarav Sharma',
    title: 'Grade 10-A · Roll No. 01',
    initials: 'AS',
    gradient: 'from-sky-500 to-blue-600',
    accent: 'text-sky-600 dark:text-sky-400'
  }
};

const ROLE_COLORS: Record<UserRole, string> = {
  Principal: '#6366f1',
  Admin: '#059669',
  Teacher: '#7c3aed',
  Parent: '#d97706',
  Student: '#0284c7'
};

export default function LayoutWrapper({ children, activeTab, setActiveTab }: LayoutWrapperProps) {
  const {
    activeRole,
    setRole,
    notifications,
    markNotificationRead,
    clearNotifications,
    students,
    homework,
    announcements,
    setSelectedStudentId
  } = useSchoolStore();

  const { toast } = useToast();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Premium Header Popovers
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState('AY 2025–26');

  // Theme Management
  const [isDark, setIsDark] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const config = ROLE_CONFIG[activeRole];
  const unread = notifications.filter(n => !n.read).length;

  // Initialize Theme
  useEffect(() => {
    const isDarkClass = document.documentElement.classList.contains('dark');
    const timer = setTimeout(() => {
      setIsDark(isDarkClass);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: `${nextDark ? 'Dark' : 'Light'} Mode Active`,
      description: `Interface styling adjusted for ${nextDark ? 'night' : 'day'} usage.`,
      variant: 'info'
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setIsLangOpen(false);
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setIsYearOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Global search memoization to avoid setState in effect
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { type: string; label: string; action: () => void }[] = [];
    students.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)) {
        results.push({
          type: 'Student',
          label: `${s.name} · Grade ${s.classId} · ${s.rollNo}`,
          action: () => {
            setSelectedStudentId(s.id);
            setActiveTab(activeRole === 'Admin' ? 'Students' : activeRole === 'Teacher' ? 'Gradebook' : 'Dashboard');
            setIsSearchOpen(false); setSearchQuery('');
          }
        });
      }
    });
    homework.forEach(hw => {
      if (hw.title.toLowerCase().includes(q) || hw.subject.toLowerCase().includes(q)) {
        results.push({
          type: 'Assignment',
          label: `${hw.subject}: ${hw.title} (${hw.classId})`,
          action: () => {
            if (activeRole === 'Teacher') setActiveTab('Homework');
            else if (activeRole === 'Student') setActiveTab('Assignments');
            setIsSearchOpen(false); setSearchQuery('');
          }
        });
      }
    });
    announcements.forEach(ann => {
      if (ann.title.toLowerCase().includes(q)) {
        results.push({
          type: 'Notice',
          label: ann.title,
          action: () => {
            if (activeRole === 'Principal') setActiveTab('Dashboard');
            else if (activeRole === 'Parent') setActiveTab('Communication');
            setIsSearchOpen(false); setSearchQuery('');
          }
        });
      }
    });
    return results.slice(0, 6);
  }, [searchQuery, students, homework, announcements, activeRole, setActiveTab, setSelectedStudentId]);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(p => !p);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsProfileOpen(false);
        setIsLangOpen(false);
        setIsYearOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [isSearchOpen]);

  const handleRoleSwitch = (role: UserRole) => {
    setRole(role);
    if (role === 'Admin') {
      setActiveTab('Students');
    } else {
      setActiveTab('Dashboard');
    }
    setIsMobileOpen(false);
    toast({ title: `Previewing as ${role}`, description: `Access clearance level modified to: ${ROLE_CONFIG[role].title}`, variant: 'success' });
  };

  // Redesigned Sidebar Items and Section Routing Logic
  const sidebarSections = [
    {
      id: 'principal',
      title: 'Principal Workspace',
      items: [
        {
          label: 'Morning Brief',
          icon: Home,
          action: () => {
            if (activeRole === 'Admin') {
              handleRoleSwitch('Principal');
            } else {
              setActiveTab('Dashboard');
            }
          },
          isActive: activeTab === 'Dashboard' && activeRole !== 'Admin',
          badge: activeRole === 'Principal' ? 'Daily' : undefined
        },
        {
          label: 'Priority Actions',
          icon: Zap,
          action: () => {
            if (activeRole !== 'Principal' && activeRole !== 'Teacher' && activeRole !== 'Admin') {
              handleRoleSwitch('Principal');
            }
            setActiveTab('Dashboard');
            // Micro animation: smooth scroll to critical items
            setTimeout(() => {
              const el = document.getElementById('priority-brief-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          },
          isActive: false,
          badge: activeRole === 'Principal' ? `${students.filter(s => s.riskStatus === 'High').length}` : undefined,
          badgeType: 'danger'
        },
        {
          label: 'School Pulse',
          icon: Activity,
          action: () => {
            if (activeRole === 'Principal') {
              setActiveTab('Analytics');
            } else if (activeRole === 'Student') {
              setActiveTab('Progress Report');
            } else if (activeRole === 'Parent') {
              setActiveTab('Dashboard');
            } else {
              handleRoleSwitch('Principal');
              setActiveTab('Analytics');
            }
          },
          isActive: activeTab === 'Analytics' || activeTab === 'Progress Report'
        }
      ]
    },
    {
      id: 'academics',
      title: 'Academics',
      items: [
        {
          label: 'Students',
          icon: Users,
          action: () => {
            if (activeRole !== 'Admin') handleRoleSwitch('Admin');
            setActiveTab('Students');
          },
          isActive: activeTab === 'Students',
          badge: `${students.length}`
        },
        {
          label: 'Teachers',
          icon: GraduationCap,
          action: () => {
            if (activeRole !== 'Admin') handleRoleSwitch('Admin');
            setActiveTab('Teachers');
          },
          isActive: activeTab === 'Teachers'
        },
        {
          label: 'Assessments',
          icon: BookOpen,
          action: () => {
            if (activeRole === 'Teacher') {
              setActiveTab('Homework');
            } else if (activeRole === 'Student') {
              setActiveTab('Assignments');
            } else {
              handleRoleSwitch('Teacher');
              setActiveTab('Homework');
            }
          },
          isActive: activeTab === 'Homework' || activeTab === 'Assignments'
        },
        {
          label: 'Gradebook',
          icon: ClipboardList,
          action: () => {
            if (activeRole === 'Teacher') {
              setActiveTab('Gradebook');
            } else if (activeRole === 'Student') {
              setActiveTab('Progress Report');
            } else if (activeRole === 'Parent') {
              setActiveTab('Academics');
            } else {
              handleRoleSwitch('Teacher');
              setActiveTab('Gradebook');
            }
          },
          isActive: activeTab === 'Gradebook' || activeTab === 'Academics'
        }
      ]
    },
    {
      id: 'operations',
      title: 'Operations',
      items: [
        {
          label: 'Attendance Center',
          icon: UserCheck,
          action: () => {
            if (activeRole === 'Admin') {
              setActiveTab('Attendance Overview');
            } else if (activeRole === 'Teacher') {
              setActiveTab('Mark Attendance');
            } else if (activeRole === 'Parent') {
              setActiveTab('Attendance History');
            } else {
              handleRoleSwitch('Admin');
              setActiveTab('Attendance Overview');
            }
          },
          isActive: activeTab === 'Attendance Overview' || activeTab === 'Mark Attendance' || activeTab === 'Attendance History',
          badge: students.filter(s => s.attendanceRate < 75).length > 0 ? 'Warning' : undefined,
          badgeType: 'warning'
        },
        {
          label: 'Timetable Studio',
          icon: Clock,
          action: () => {
            if (activeRole === 'Admin') {
              setActiveTab('Timetable');
            } else if (activeRole === 'Student') {
              setActiveTab('Schedules');
            } else {
              handleRoleSwitch('Admin');
              setActiveTab('Timetable');
            }
          },
          isActive: activeTab === 'Timetable' || activeTab === 'Schedules'
        },
        {
          label: 'Communications Hub',
          icon: MessageSquare,
          action: () => {
            if (activeRole === 'Parent') {
              setActiveTab('Communication');
            } else if (activeRole === 'Principal') {
              setActiveTab('Dashboard');
              setTimeout(() => {
                const el = document.getElementById('notices-brief-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 150);
            } else {
              handleRoleSwitch('Parent');
              setActiveTab('Communication');
            }
          },
          isActive: activeTab === 'Communication'
        }
      ]
    },
    {
      id: 'insights',
      title: 'Insights',
      items: [
        {
          label: 'Performance',
          icon: TrendingUp,
          action: () => {
            if (activeRole !== 'Principal') handleRoleSwitch('Principal');
            setActiveTab('Dashboard');
            // Trigger Audit Reports dialog directly
            setTimeout(() => {
              const auditBtn = document.getElementById('audit-reports-trigger-btn');
              if (auditBtn) auditBtn.click();
            }, 100);
          },
          isActive: false
        },
        {
          label: 'Finance',
          icon: CreditCard,
          action: () => {
            if (activeRole !== 'Parent') handleRoleSwitch('Parent');
            setActiveTab('Dashboard');
            // Trigger fee dialog directly
            setTimeout(() => {
              const payBtn = document.querySelector('button[onClick*="setIsFeeOpen"]');
              if (payBtn) (payBtn as HTMLElement).click();
              else toast({ title: 'Finance Center', description: 'Outstanding fee collection rate reached 91%.', variant: 'info' });
            }, 100);
          },
          isActive: false
        },
        {
          label: 'Compliance',
          icon: Shield,
          action: () => {
            toast({
              title: 'Regulatory Audit Compliance',
              description: 'EduSphere 360 curriculum audit compliance is fully verified (100% score).',
              variant: 'success'
            });
          },
          isActive: false
        }
      ]
    }
  ];

  const accentColor = ROLE_COLORS[activeRole];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">

      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 border-r border-[var(--border)] bg-[var(--sidebar-bg)] transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-[64px]' : 'w-[240px]'
          }`}
        style={{ boxShadow: 'inset -1px 0 0 var(--border)' }}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 h-[56px] px-4 border-b border-[var(--border)] flex-shrink-0">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br ${config.gradient} transition-transform duration-200 hover:rotate-6`}
            style={{ boxShadow: `0 3px 8px ${accentColor}30` }}
          >
            <GraduationCap className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0 animate-fade-in">
              <div className="text-[12.5px] font-bold tracking-tight text-[var(--foreground)] truncate">EduSphere 360</div>
              <div className="text-[9px] font-bold text-[var(--foreground-muted)] tracking-wider uppercase mt-0.5">School OS v5.0</div>
            </div>
          )}
        </div>

        {/* Workspace Productivity Navigator */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-4">
          {sidebarSections.map((sec) => (
            <div key={sec.id} className="space-y-1">
              {!isSidebarCollapsed ? (
                <div className="sidebar-group-header">{sec.title}</div>
              ) : (
                <div className="h-px bg-[var(--border)] my-2" />
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.isActive;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''} group`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`h-[16px] w-[16px] flex-shrink-0 transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]'
                        }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {item.badge && !isSidebarCollapsed && (
                      <span className={`tag ${item.badgeType === 'danger' ? 'tag-red' :
                          item.badgeType === 'warning' ? 'tag-amber' : 'tag-indigo'
                        } text-[8px] py-0 px-1.5`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar User Footer */}
        <div className="border-t border-[var(--border)] p-3.5 flex-shrink-0 bg-[var(--secondary)]">
          {isSidebarCollapsed ? (
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold bg-gradient-to-br ${config.gradient} cursor-pointer hover:opacity-90`}
              title={config.name}
            >
              {config.initials}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 animate-fade-in">
              <div
                className={`h-7.5 w-7.5 rounded-lg flex items-center justify-center text-white text-[10.5px] font-bold bg-gradient-to-br ${config.gradient} flex-shrink-0`}
              >
                {config.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-[var(--foreground)] truncate leading-tight">{config.name}</div>
                <div className="text-[9.5px] font-semibold text-[var(--foreground-muted)] truncate leading-tight mt-0.5">{config.title}</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Column ──────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Premium Top Sticky Command Bar Header */}
        <header
          className="h-[56px] sticky top-0 flex items-center justify-between px-4 md:px-5 border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0 z-20"
          style={{ boxShadow: '0 1px 0 var(--border)' }}
        >
          {/* Left: Collapser + Title Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => isSidebarCollapsed || window.innerWidth < 768
                ? (window.innerWidth < 768 ? setIsMobileOpen(true) : setIsSidebarCollapsed(false))
                : setIsSidebarCollapsed(true)
              }
              className="p-1.5 rounded-lg hover:bg-[var(--secondary)] transition-colors cursor-pointer"
            >
              <Menu className="h-4.5 w-4.5 text-[var(--foreground-muted)]" />
            </button>
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="font-bold text-[var(--foreground-muted)] hidden sm:inline">EduSphere OS</span>
              <ChevronRight className="h-3 w-3 text-[var(--foreground-subtle)] hidden sm:inline" />
              <span className="font-semibold text-[var(--foreground-muted)] capitalize hidden md:inline">{activeRole}</span>
              <ChevronRight className="h-3 w-3 text-[var(--foreground-subtle)] hidden md:inline" />
              <span className="font-bold text-[var(--foreground)]">{activeTab}</span>
            </div>
          </div>

          {/* Center: Global Command Search Bar (⌘K input UI style) */}
          <div className="hidden lg:flex items-center gap-2 relative w-[320px]">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[12px] text-[var(--foreground-muted)] bg-[var(--secondary)] hover:bg-[var(--border)] border border-[var(--border)] rounded-lg cursor-pointer transition-all hover:border-[var(--border-strong)]"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-[var(--foreground-subtle)]" />
                <span>Search command center...</span>
              </div>
              <kbd className="inline-flex items-center px-1.5 h-4.5 text-[8.5px] font-bold bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-[var(--foreground-subtle)]">⌘K</kbd>
            </button>
          </div>

          {/* Right Section: Controls, Switcher, Switchers */}
          <div className="flex items-center gap-2">

            {/* Live Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--success-subtle)] border border-[rgba(16,185,129,0.15)] text-[9px] font-bold text-[var(--success)] tracking-wide">
              <span className="live-dot text-[var(--success)]">
                <span className="glow-dot" style={{ background: 'var(--success)', width: '5px', height: '5px', borderRadius: '50%', display: 'block' }} />
              </span>
              <span>LIVE CORE</span>
            </div>

            {/* Search Trigger for Mobile */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex lg:hidden p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--secondary)] transition-colors cursor-pointer"
              title="Search command center"
            >
              <Search className="h-3.5 w-3.5" />
            </button>

            {/* Academic Year Dropdown */}
            <div className="relative hidden md:block" ref={yearRef}>
              <button
                onClick={() => setIsYearOpen(!isYearOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--secondary)] transition-colors cursor-pointer"
              >
                <span>{currentYear}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {isYearOpen && (
                <div className="absolute right-0 mt-1.5 w-[140px] surface-raised shadow-xl z-50 overflow-hidden animate-scale-in p-1 text-[11.5px]">
                  {[
                    { val: 'AY 2025–26', label: 'AY 2025–26 (Active)' },
                    { val: 'AY 2024–25', label: 'AY 2024–25' }
                  ].map(y => (
                    <button
                      key={y.val}
                      onClick={() => {
                        setCurrentYear(y.val);
                        setIsYearOpen(false);
                        toast({ title: 'Academic Year Selected', description: `Switched preview calendar context to ${y.val}.`, variant: 'info' });
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[var(--primary-subtle)] text-left text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    >
                      <span>{y.val}</span>
                      {currentYear === y.val && <Check className="h-3 w-3 text-[var(--primary)]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Dropdown Selector (English / தமிழ் placeholder) */}
            <div className="relative hidden md:block" ref={langRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--secondary)] transition-colors cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-[var(--foreground-subtle)]" />
                <span>{currentLang}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-1.5 w-[120px] surface-raised shadow-xl z-50 overflow-hidden animate-scale-in p-1 text-[11.5px]">
                  {[
                    { code: 'en', val: 'English' },
                    { code: 'ta', val: 'தமிழ்' }
                  ].map(l => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setCurrentLang(l.val);
                        setIsLangOpen(false);
                        toast({ title: `Language set to ${l.val}`, description: 'Note: Translation updates are mock preview placeholders only.', variant: 'info' });
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[var(--primary-subtle)] text-left text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    >
                      <span>{l.val}</span>
                      {currentLang === l.val && <Check className="h-3 w-3 text-[var(--primary)]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleDarkMode}
              className="p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--secondary)] transition-colors cursor-pointer"
              title="Toggle styling theme"
            >
              {isDark ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--secondary)] transition-colors cursor-pointer"
              >
                <Bell className="h-3.5 w-3.5" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[var(--danger)] text-[8px] font-bold text-white flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-1.5 w-[300px] surface-raised shadow-xl z-50 overflow-hidden animate-scale-in">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--secondary)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Notifications</span>
                    <button onClick={clearNotifications} className="text-[10px] font-semibold text-[var(--primary)] hover:underline cursor-pointer">Clear all</button>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto divide-y divide-[var(--border-subtle)]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-[12px] text-[var(--foreground-muted)]">No notifications</div>
                    ) : notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3.5 cursor-pointer hover:bg-[var(--primary-subtle)] transition-colors ${!n.read ? 'bg-[var(--primary-subtle)]' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11.5px] font-bold text-[var(--foreground)] leading-snug">{n.title}</span>
                          <span className="text-[9px] text-[var(--foreground-subtle)] font-mono">{n.date}</span>
                        </div>
                        <p className="text-[10.5px] text-[var(--foreground-muted)] mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 p-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--secondary)] transition-colors cursor-pointer"
              >
                <div
                  className={`h-6 w-6 rounded-md flex items-center justify-center text-white text-[9.5px] font-bold bg-gradient-to-br ${config.gradient}`}
                >
                  {config.initials}
                </div>
                <ChevronDown className="h-3 w-3 text-[var(--foreground-muted)]" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-1.5 w-[200px] surface-raised shadow-xl z-50 overflow-hidden animate-scale-in p-1 text-[12px]">
                  <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                    <div className="font-bold text-[var(--foreground)] truncate">{config.name}</div>
                    <div className="text-[10px] text-[var(--foreground-muted)] truncate mt-0.5">{config.title}</div>
                  </div>
                  <button
                    onClick={() => { setIsProfileOpen(false); toast({ title: 'Workspace Settings', description: 'System setup locked in live core mode.', variant: 'info' }); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[var(--primary-subtle)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-left"
                  >
                    <Settings className="h-3.5 w-3.5 text-[var(--foreground-subtle)]" /> Settings
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); toast({ title: 'Clearance Clear', description: 'Cleared security log credentials.', variant: 'info' }); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[var(--primary-subtle)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-left"
                  >
                    <Shield className="h-3.5 w-3.5 text-[var(--foreground-subtle)]" /> Security
                  </button>
                  <hr className="my-1 border-[var(--border)]" />
                  <button
                    onClick={() => { setIsProfileOpen(false); toast({ title: 'Session Suspended', description: 'Reload the tab to re-verify session.', variant: 'warning' }); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[var(--danger-subtle)] text-[var(--foreground-muted)] hover:text-[var(--danger)] text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Premium Dynamic Preview Switcher (Vercel-style scrollable strip on mobile, flex on desktop) */}
        <div className="bg-[var(--secondary)] px-4 py-2 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center gap-2 md:gap-2.5 flex-shrink-0 text-[11.5px]">
          <span className="font-bold text-[var(--foreground-muted)] text-[9.5px] uppercase tracking-wider shrink-0 select-none">
            Role Preview Dashboard:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 flex-nowrap py-0.5 w-full">
            {(['Principal', 'Admin', 'Teacher', 'Parent', 'Student'] as UserRole[]).map((r) => {
              const isActive = activeRole === r;
              return (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`px-3.5 py-1 text-[11px] font-bold rounded-full transition-all border cursor-pointer shrink-0 ${isActive
                      ? 'bg-[var(--surface)] text-[var(--foreground)] border-[var(--border-strong)] shadow-sm font-extrabold'
                      : 'bg-transparent border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] font-semibold'
                    }`}
                  style={isActive ? { color: ROLE_COLORS[r] } : {}}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)]">
          <div className="max-w-[1300px] mx-auto px-4 md:px-5 py-5 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile Sidebar Drawer ────────────────────────── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative flex flex-col w-[260px] bg-[var(--surface)]/95 backdrop-blur-md border-r border-[var(--border)] h-full z-10 shadow-2xl rounded-r-2xl overflow-hidden">

            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 h-[56px] border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold bg-gradient-to-br ${config.gradient}`}>
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="text-[12.5px] font-bold text-[var(--foreground)]">EduSphere 360</span>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--secondary)] cursor-pointer">
                <X className="h-4.5 w-4.5 text-[var(--foreground-muted)]" />
              </button>
            </div>

            {/* Grouped navigator */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4">
              {sidebarSections.map((sec) => (
                <div key={sec.id} className="space-y-0.5">
                  <div className="sidebar-group-header">{sec.title}</div>
                  {sec.items.map(item => {
                    const Icon = item.icon;
                    const isActive = item.isActive;
                    return (
                      <button
                        key={item.label}
                        onClick={() => { item.action(); setIsMobileOpen(false); }}
                        className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                      >
                        <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground-subtle)]'}`} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Mobile selectors for AY & Lang */}
            <div className="px-4 py-3 border-t border-[var(--border)] flex gap-2 bg-[var(--secondary)]">
              <div className="flex-1">
                <label className="text-[8px] font-bold uppercase tracking-wider text-[var(--foreground-subtle)] block mb-1">Academic Year</label>
                <select
                  value={currentYear}
                  onChange={e => {
                    setCurrentYear(e.target.value);
                    toast({ title: 'Academic Year Selected', description: `Switched preview calendar context to ${e.target.value}.`, variant: 'info' });
                  }}
                  className="w-full text-[11px] font-bold border border-[var(--border)] rounded-md bg-[var(--surface)] p-1 text-[var(--foreground-muted)] outline-none"
                >
                  <option value="AY 2025–26">AY 2025–26</option>
                  <option value="AY 2024–25">AY 2024–25</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[8px] font-bold uppercase tracking-wider text-[var(--foreground-subtle)] block mb-1">Language</label>
                <select
                  value={currentLang}
                  onChange={e => {
                    setCurrentLang(e.target.value);
                    toast({ title: `Language set to ${e.target.value}`, description: 'Note: Translation updates are mock preview placeholders only.', variant: 'info' });
                  }}
                  className="w-full text-[11px] font-bold border border-[var(--border)] rounded-md bg-[var(--surface)] p-1 text-[var(--foreground-muted)] outline-none"
                >
                  <option value="English">English</option>
                  <option value="தமிழ்">தமிழ்</option>
                </select>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="border-t border-[var(--border)] px-4 py-3 flex items-center gap-2 bg-[var(--secondary)]">
              <div className={`h-7.5 w-7.5 rounded-lg flex items-center justify-center text-white text-[10.5px] font-bold bg-gradient-to-br ${config.gradient} flex-shrink-0`}>
                {config.initials}
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-bold text-[var(--foreground)] truncate">{config.name}</div>
                <div className="text-[9.5px] text-[var(--foreground-muted)] truncate">{config.title}</div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── Spotlight Command Search Dialog (⌘K) ───────────────── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-xs" onClick={() => setIsSearchOpen(false)} />
          <div className="relative w-full max-w-[500px] surface-raised rounded-xl shadow-2xl overflow-hidden animate-scale-in border border-[var(--border)]">
            <div className="flex items-center gap-2.5 px-4 border-b border-[var(--border)] bg-[var(--surface)]">
              <Search className="h-4 w-4 text-[var(--foreground-subtle)] flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder='Type student name, notices, homework...'
                className="flex-1 py-3 text-[12.5px] bg-transparent border-0 outline-none text-[var(--foreground)] placeholder-[var(--foreground-subtle)] font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-[9px] font-bold border border-[var(--border)] px-1.5 py-0.5 rounded-[4px] bg-[var(--secondary)] text-[var(--foreground-muted)] cursor-pointer hover:bg-[var(--primary-subtle)]">ESC</button>
            </div>
            <div className="max-h-[260px] overflow-y-auto bg-[var(--surface)]">
              {searchQuery.trim() === '' ? (
                <div className="p-5 text-center">
                  <p className="text-[11.5px] text-[var(--foreground-muted)]">Global Search Command Center</p>
                  <div className="flex items-center justify-center gap-2.5 mt-2">
                    {['Students', 'Assignments', 'Notices'].map(h => (
                      <span key={h} className="tag tag-slate text-[9px]">{h}</span>
                    ))}
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-5 text-center text-[11.5px] text-[var(--foreground-muted)]">
                  No records matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="p-1">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={r.action}
                      className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-medium text-[var(--foreground)] rounded-md hover:bg-[var(--primary-subtle)] transition-colors text-left cursor-pointer group"
                    >
                      <span>{r.label}</span>
                      <span className="tag tag-slate ml-2 flex-shrink-0 text-[8px]">{r.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

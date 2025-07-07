
'use client';

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
    Home, MoreHorizontal, Search, FileText, 
    Link2, Building2, UserCheck, CalendarDays, Target, Book, Palette, MessageSquare, 
    GraduationCap, Utensils, PartyPopper, Mic, Landmark, Mail, Users, Briefcase, 
    Star, DollarSign, Shield, Scale, ThumbsUp, Video, Wrench, Monitor
} from "lucide-react";

const categories = [
  { name: "My Templates", color: "text-pink-500", href: "#my-templates" },
  { name: "Accounting", color: "text-red-500", href: "#accounting" },
  { name: "Bookkeeping", color: "text-orange-500", href: "#bookkeeping" },
  { name: "Coaching/Consulting", color: "text-amber-500", href: "#coaching-consulting" },
  { name: "Design", color: "text-cyan-500", href: "#design" },
  { name: "Education", color: "text-blue-500", href: "#education" },
  { name: "Events", color: "text-purple-500", href: "#events" },
  { name: "Financial Planning", color: "text-emerald-500", href: "#financial-planning" },
  { name: "General", color: "text-gray-500", href: "#general" },
  { name: "Human Resources", color: "text-rose-500", href: "#human-resources" },
  { name: "Insurance", color: "text-sky-500", href: "#insurance" },
  { name: "Legal", color: "text-indigo-500", href: "#legal" },
  { name: "Marketing", color: "text-yellow-500", href: "#marketing" },
  { name: "Mortgage & Financing", color: "text-lime-500", href: "#mortgage-financing" },
  { name: "Real Estate", color: "text-green-500", href: "#real-estate" },
  { name: "Web Design", color: "text-fuchsia-500", href: "#web-design" },
];

const myTemplates = [
  {
    id: 'temp-01',
    title: "New Request Template",
    description: "No description provided.",
    icon: <Home className="h-6 w-6 text-teal-600" />,
    bgColor: "bg-teal-100",
  },
  {
    id: 'temp-02',
    title: "New Request Template (1)",
    description: "No description provided.",
    icon: <Home className="h-6 w-6 text-teal-600" />,
    bgColor: "bg-teal-100",
  },
  {
    id: 'temp-03',
    title: "Temp 1",
    description: "No description provided.",
    icon: <Home className="h-6 w-6 text-teal-600" />,
    bgColor: "bg-teal-100",
  },
  {
    id: 'temp-04',
    title: "Temp 2",
    description: "No description provided.",
    icon: <Home className="h-6 w-6 text-teal-600" />,
    bgColor: "bg-teal-100",
  },
];

const galleryTemplates = [
  {
    category: "Accounting",
    categoryColor: "text-red-500",
    items: [
      { id: 'gallery-ac-1', title: "ATO Client-agent Linking", description: "This template walks clients through the steps to link you as their authorised agent using myID...", icon: <Link2 className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-2', title: "Accounting Client Onboarding (UK)", description: "Gather key financial and business Information from new accounting clients in the UK with this structured...", icon: <Building2 className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-3', title: "Accounting Client Onboarding - Business (AUS)", description: "Geared towards Australian accountants, this form will help facilitate an easy onboarding process...", icon: <Building2 className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-4', title: "Accounting Client Onboarding - Business (NZ)", description: "Focusing on New Zealand accountants, this form will help facilitate an easy onboarding process...", icon: <Building2 className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-5', title: "Accounting Client Onboarding - Individual (AUS)", description: "Geared towards Australian accountants, this form will help facilitate an easy onboarding process...", icon: <UserCheck className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-6', title: "Accounting Client Onboarding - Individual (NZ)", description: "Focusing on New Zealand accountants, this form will help facilitate an easy onboarding process...", icon: <UserCheck className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-7', title: "Accounting Client Onboarding - Individual (UK)", description: "Gather key financial and business Information from new accounting clients in the UK with this structured...", icon: <UserCheck className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-8', title: "Deed of Dividend", description: "A formal document for declaring dividends to shareholders.", icon: <FileText className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-9', title: "End of Financial Year (AUS)", description: "A checklist for Australian businesses to prepare for the end of the financial year.", icon: <CalendarDays className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-10', title: "SMSF Annual Checklist", description: "A checklist for Self-Managed Super Funds to complete their annual obligations.", icon: <FileText className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-11', title: "SMSF Investment Strategy", description: "A template for creating an investment strategy for a Self-Managed Super Fund.", icon: <Target className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-12', title: "Tax Pre-appointment Checklist", description: "A checklist for clients to prepare for their tax appointment.", icon: <FileText className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
      { id: 'gallery-ac-13', title: "Trust Distribution Resolution", description: "A formal document for recording trust distribution decisions.", icon: <FileText className="h-6 w-6 text-red-600" />, bgColor: "bg-red-100" },
    ],
  },
  {
    category: "Bookkeeping",
    categoryColor: "text-orange-500",
    items: [
      { id: 'gallery-bk-1', title: "Bookkeeping Client Onboarding (AUS)", description: "Onboard new bookkeeping clients in Australia and gather all necessary business and financial information.", icon: <Book className="h-6 w-6 text-orange-600" />, bgColor: "bg-orange-100" },
      { id: 'gallery-bk-2', title: "Bookkeeping Client Onboarding (NZ)", description: "Onboard new bookkeeping clients in New Zealand and gather all necessary business and financial information.", icon: <Book className="h-6 w-6 text-orange-600" />, bgColor: "bg-orange-100" },
      { id: 'gallery-bk-3', title: "Bookkeeping Client Onboarding (UK)", description: "Onboard new bookkeeping clients in the UK and gather all necessary business and financial information.", icon: <Book className="h-6 w-6 text-orange-600" />, bgColor: "bg-orange-100" },
      { id: 'gallery-bk-4', title: "Quarterly BAS Checklist", description: "A checklist for clients to provide all documents for their quarterly Business Activity Statement.", icon: <FileText className="h-6 w-6 text-orange-600" />, bgColor: "bg-orange-100" },
    ],
  },
  {
    category: "Coaching/Consulting",
    categoryColor: "text-amber-500",
    items: [
      { id: 'gallery-cc-1', title: "Business Coaching Intake", description: "A comprehensive form for new business coaching clients to outline their goals.", icon: <Briefcase className="h-6 w-6 text-amber-600" />, bgColor: "bg-amber-100" },
      { id: 'gallery-cc-2', title: "Client Testimonial Request", description: "A template for requesting testimonials from satisfied clients.", icon: <Star className="h-6 w-6 text-amber-600" />, bgColor: "bg-amber-100" },
      { id: 'gallery-cc-3', title: "Consulting Intake Form", description: "A standard intake form for new consulting clients.", icon: <FileText className="h-6 w-6 text-amber-600" />, bgColor: "bg-amber-100" },
      { id: 'gallery-cc-4', title: "Life Coaching Intake", description: "A form designed for life coaches to onboard new clients.", icon: <UserCheck className="h-6 w-6 text-amber-600" />, bgColor: "bg-amber-100" },
      { id: 'gallery-cc-5', title: "Monthly Coaching Check-in", description: "A monthly check-in form for coaching clients to track progress.", icon: <CalendarDays className="h-6 w-6 text-amber-600" />, bgColor: "bg-amber-100" },
    ],
  },
  {
    category: "Design",
    categoryColor: "text-cyan-500",
    items: [
      { id: 'gallery-ds-1', title: "Brand Design Brief", description: "Collect project requirements for a full brand identity project.", icon: <Palette className="h-6 w-6 text-cyan-600" />, bgColor: "bg-cyan-100" },
      { id: 'gallery-ds-2', title: "Graphic Design Brief", description: "Collect project requirements for new graphic design projects.", icon: <Palette className="h-6 w-6 text-cyan-600" />, bgColor: "bg-cyan-100" },
      { id: 'gallery-ds-3', title: "Logo Design Brief", description: "A detailed brief for clients to provide their logo design requirements.", icon: <Palette className="h-6 w-6 text-cyan-600" />, bgColor: "bg-cyan-100" },
      { id: 'gallery-ds-4', title: "Print Design Brief", description: "A brief for clients to provide requirements for print design work.", icon: <Palette className="h-6 w-6 text-cyan-600" />, bgColor: "bg-cyan-100" },
    ],
  },
  {
    category: "Education",
    categoryColor: "text-blue-500",
    items: [
      { id: 'gallery-ed-1', title: "Course Feedback", description: "A form for students to provide feedback on a course.", icon: <MessageSquare className="h-6 w-6 text-blue-600" />, bgColor: "bg-blue-100" },
      { id: 'gallery-ed-2', title: "Student Application Form", description: "A standard form for new students to apply for a course or program.", icon: <GraduationCap className="h-6 w-6 text-blue-600" />, bgColor: "bg-blue-100" },
      { id: 'gallery-ed-3', title: "Tutor Intake", description: "A form for new tutors to provide their details and qualifications.", icon: <UserCheck className="h-6 w-6 text-blue-600" />, bgColor: "bg-blue-100" },
    ],
  },
  {
    category: "Events",
    categoryColor: "text-purple-500",
    items: [
      { id: 'gallery-ev-1', title: "Catering Request", description: "A form for clients to request catering services for an event.", icon: <Utensils className="h-6 w-6 text-purple-600" />, bgColor: "bg-purple-100" },
      { id: 'gallery-ev-2', title: "Event Feedback", description: "A form for event attendees to provide feedback.", icon: <MessageSquare className="h-6 w-6 text-purple-600" />, bgColor: "bg-purple-100" },
      { id: 'gallery-ev-3', title: "Event Planning", description: "Gather all the details you need to plan and execute a successful event.", icon: <PartyPopper className="h-6 w-6 text-purple-600" />, bgColor: "bg-purple-100" },
      { id: 'gallery-ev-4', title: "Speaker Information Request", description: "A form for event speakers to provide their details.", icon: <Mic className="h-6 w-6 text-purple-600" />, bgColor: "bg-purple-100" },
      { id: 'gallery-ev-5', title: "Venue Booking Request", description: "A form for clients to request a venue booking.", icon: <Building2 className="h-6 w-6 text-purple-600" />, bgColor: "bg-purple-100" },
    ],
  },
  {
    category: "Financial Planning",
    categoryColor: "text-emerald-500",
    items: [
      { id: 'gallery-fp-1', title: "Financial Planning Client Onboarding (AUS)", description: "A detailed fact-find for new financial planning clients in Australia.", icon: <Landmark className="h-6 w-6 text-emerald-600" />, bgColor: "bg-emerald-100" },
      { id: 'gallery-fp-2', title: "Financial Planning Client Onboarding (NZ)", description: "A detailed fact-find for new financial planning clients in New Zealand.", icon: <Landmark className="h-6 w-6 text-emerald-600" />, bgColor: "bg-emerald-100" },
      { id: 'gallery-fp-3', title: "Financial Planning Client Onboarding (UK)", description: "A detailed fact-find for new financial planning clients in the UK.", icon: <Landmark className="h-6 w-6 text-emerald-600" />, bgColor: "bg-emerald-100" },
    ],
  },
  {
    category: "General",
    categoryColor: "text-gray-500",
    items: [
      { id: 'gallery-ge-1', title: "Contact Form", description: "A simple, general-purpose contact form for your clients.", icon: <Mail className="h-6 w-6 text-gray-600" />, bgColor: "bg-gray-100" },
      { id: 'gallery-ge-2', title: "Detailed Contact Form", description: "A more detailed contact form for gathering more information from clients.", icon: <Mail className="h-6 w-6 text-gray-600" />, bgColor: "bg-gray-100" },
    ],
  },
  {
    category: "Human Resources",
    categoryColor: "text-rose-500",
    items: [
      { id: 'gallery-hr-1', title: "Employee Expense Claim", description: "A form for employees to claim expenses.", icon: <DollarSign className="h-6 w-6 text-rose-600" />, bgColor: "bg-rose-100" },
      { id: 'gallery-hr-2', title: "Employee Offboarding", description: "A checklist for offboarding employees.", icon: <Users className="h-6 w-6 text-rose-600" />, bgColor: "bg-rose-100" },
      { id: 'gallery-hr-3', title: "Employee Onboarding", description: "Collect all necessary information from new hires for HR and payroll.", icon: <Users className="h-6 w-6 text-rose-600" />, bgColor: "bg-rose-100" },
      { id: 'gallery-hr-4', title: "Job Application", description: "A standard job application form for prospective employees.", icon: <Briefcase className="h-6 w-6 text-rose-600" />, bgColor: "bg-rose-100" },
      { id: 'gallery-hr-5', title: "Performance Review", description: "A form for conducting employee performance reviews.", icon: <Star className="h-6 w-6 text-rose-600" />, bgColor: "bg-rose-100" },
      { id: 'gallery-hr-6', title: "Reference Check", description: "A form for conducting reference checks on job applicants.", icon: <UserCheck className="h-6 w-6 text-rose-600" />, bgColor: "bg-rose-100" },
    ],
  },
  {
    category: "Insurance",
    categoryColor: "text-sky-500",
    items: [
      { id: 'gallery-in-1', title: "Insurance Claim", description: "A form for clients to make an insurance claim.", icon: <Shield className="h-6 w-6 text-sky-600" />, bgColor: "bg-sky-100" },
      { id: 'gallery-in-2', title: "Insurance Fact Find (AUS)", description: "A fact-find form for insurance clients in Australia.", icon: <Shield className="h-6 w-6 text-sky-600" />, bgColor: "bg-sky-100" },
      { id: 'gallery-in-3', title: "Insurance Fact Find (NZ)", description: "A fact-find form for insurance clients in New Zealand.", icon: <Shield className="h-6 w-6 text-sky-600" />, bgColor: "bg-sky-100" },
      { id: 'gallery-in-4', title: "Insurance Fact Find (UK)", description: "A fact-find form for insurance clients in the UK.", icon: <Shield className="h-6 w-6 text-sky-600" />, bgColor: "bg-sky-100" },
      { id: 'gallery-in-5', title: "Insurance Quote Request", description: "A form for prospective clients to request an insurance quote.", icon: <Shield className="h-6 w-6 text-sky-600" />, bgColor: "bg-sky-100" },
    ],
  },
  {
    category: "Legal",
    categoryColor: "text-indigo-500",
    items: [
      { id: 'gallery-lg-1', title: "Client Intake Form", description: "A secure form for new legal clients to provide their case details.", icon: <Scale className="h-6 w-6 text-indigo-600" />, bgColor: "bg-indigo-100" },
    ],
  },
  {
    category: "Marketing",
    categoryColor: "text-yellow-500",
    items: [
      { id: 'gallery-ma-1', title: "Case Study", description: "A template for creating a case study on a successful project.", icon: <Book className="h-6 w-6 text-yellow-600" />, bgColor: "bg-yellow-100" },
      { id: 'gallery-ma-2', title: "Content Marketing Brief", description: "A brief for clients to provide their content marketing requirements.", icon: <FileText className="h-6 w-6 text-yellow-600" />, bgColor: "bg-yellow-100" },
      { id: 'gallery-ma-3', title: "Marketing Campaign Brief", description: "Define goals, target audience, budget, and KPIs for a new marketing campaign.", icon: <Target className="h-6 w-6 text-yellow-600" />, bgColor: "bg-yellow-100" },
      { id: 'gallery-ma-4', title: "Podcast Guest Intake", description: "A form for podcast guests to provide their details.", icon: <Mic className="h-6 w-6 text-yellow-600" />, bgColor: "bg-yellow-100" },
      { id: 'gallery-ma-5', title: "Social Media Marketing Brief", description: "A brief for clients to provide their social media marketing requirements.", icon: <ThumbsUp className="h-6 w-6 text-yellow-600" />, bgColor: "bg-yellow-100" },
      { id: 'gallery-ma-6', title: "Video Marketing Brief", description: "A brief for clients to provide their video marketing requirements.", icon: <Video className="h-6 w-6 text-yellow-600" />, bgColor: "bg-yellow-100" },
    ],
  },
  {
    category: "Mortgage & Financing",
    categoryColor: "text-lime-500",
    items: [
      { id: 'gallery-mf-1', title: "Loan Application", description: "A standard loan application form.", icon: <DollarSign className="h-6 w-6 text-lime-600" />, bgColor: "bg-lime-100" },
      { id: 'gallery-mf-2', title: "Mortgage Application (AUS)", description: "A comprehensive form for clients in Australia to apply for a mortgage.", icon: <Home className="h-6 w-6 text-lime-600" />, bgColor: "bg-lime-100" },
      { id: 'gallery-mf-3', title: "Mortgage Application (NZ)", description: "A comprehensive form for clients in New Zealand to apply for a mortgage.", icon: <Home className="h-6 w-6 text-lime-600" />, bgColor: "bg-lime-100" },
      { id: 'gallery-mf-4', title: "Mortgage Application (UK)", description: "A comprehensive form for clients in the UK to apply for a mortgage.", icon: <Home className="h-6 w-6 text-lime-600" />, bgColor: "bg-lime-100" },
    ],
  },
  {
    category: "Real Estate",
    categoryColor: "text-green-500",
    items: [
      { id: 'gallery-re-1', title: "Property Maintenance Request", description: "A form for tenants to request maintenance on a property.", icon: <Wrench className="h-6 w-6 text-green-600" />, bgColor: "bg-green-100" },
      { id: 'gallery-re-2', title: "Rental Application", description: "A standard rental application form for prospective tenants.", icon: <Home className="h-6 w-6 text-green-600" />, bgColor: "bg-green-100" },
      { id: 'gallery-re-3', title: "Seller's Disclosure", description: "A form for sellers to disclose information about their property.", icon: <FileText className="h-6 w-6 text-green-600" />, bgColor: "bg-green-100" },
    ],
  },
  {
    category: "Web Design",
    categoryColor: "text-fuchsia-500",
    items: [
      { id: 'gallery-wd-1', title: "Website Content Collection", description: "A form for clients to provide content for their website.", icon: <FileText className="h-6 w-6 text-fuchsia-600" />, bgColor: "bg-fuchsia-100" },
      { id: 'gallery-wd-2', title: "Website Design Brief", description: "Collect project requirements, target audience, and design preferences for new website projects.", icon: <Monitor className="h-6 w-6 text-fuchsia-600" />, bgColor: "bg-fuchsia-100" },
      { id: 'gallery-wd-3', title: "Website Design Feedback", description: "A form for clients to provide feedback on a website design.", icon: <MessageSquare className="h-6 w-6 text-fuchsia-600" />, bgColor: "bg-fuchsia-100" },
      { id: 'gallery-wd-4', title: "Website Maintenance Request", description: "A form for clients to request maintenance on their website.", icon: <Wrench className="h-6 w-6 text-fuchsia-600" />, bgColor: "bg-fuchsia-100" },
    ],
  },
];


const TemplateCard = ({ template, onSelect }: { template: typeof myTemplates[0]; onSelect: () => void; }) => (
  <Card className="hover:shadow-lg transition-shadow cursor-pointer group flex flex-col bg-card" onClick={onSelect}>
    <CardContent className="p-4 flex gap-4 items-start flex-grow">
      <div className={`p-3 rounded-lg ${template.bgColor} flex-shrink-0`}>
        {template.icon}
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold">{template.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
      </div>
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(); }}>Use Template</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardContent>
  </Card>
);

interface TemplatesStepProps {
    onNext: () => void;
}

export default function TemplatesStep({ onNext }: TemplatesStepProps) {
    const [activeCategory, setActiveCategory] = useState("My Templates");
    const mainRef = useRef<HTMLDivElement>(null);

    const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryName: string, href: string) => {
        e.preventDefault();
        setActiveCategory(categoryName);
        const element = document.getElementById(href.substring(1));
        const mainEl = mainRef.current;
        if (element && mainEl) {
            const headerOffset = 70; // height of sticky header
            const topPos = element.offsetTop - headerOffset;
            mainEl.scrollTo({ top: topPos, behavior: 'smooth' });
        }
    };
    
    const sanitizeId = (name: string) => name.toLowerCase().replace(/[\s&/]+/g, '-');


    return (
        <div className="flex flex-1 overflow-hidden h-full bg-muted/40">
            {/* Left Sidebar */}
            <aside className="w-64 bg-background border-r p-4 overflow-y-auto shrink-0 flex flex-col">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2">TEMPLATE GALLERY</h3>
                <ul className="space-y-1 flex-grow">
                    {categories.map((cat) => (
                        <li key={cat.name}>
                            <a
                                href={cat.href}
                                onClick={(e) => handleCategoryClick(e, cat.name, cat.href)}
                                className={`flex items-center gap-3 p-2 rounded-md font-semibold text-sm transition-colors ${activeCategory === cat.name ? 'text-primary' : 'text-foreground hover:bg-muted'}`}
                            >
                                <span className={`h-2 w-2 rounded-full ${cat.color.replace('text-', 'bg-')}`}></span>
                                {cat.name}
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="mt-auto pt-4">
                  <Button variant="outline" className="w-full" onClick={onNext}>
                      Start From Scratch
                  </Button>
                </div>
            </aside>
            
            {/* Main Content */}
            <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
                {/* Header */}
                 <header className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b">
                    <div className="flex items-center gap-4">
                        <Button className="bg-primary hover:bg-primary/90" onClick={onNext}>
                            START FROM SCRATCH
                        </Button>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search for a template..." className="pl-9" />
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <div className="p-6 space-y-8">
                    <section id="my-templates">
                        <h2 className="text-xl font-bold mb-4">My Templates</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {myTemplates.map((template) => (
                                <TemplateCard key={template.id} template={template} onSelect={onNext} />
                            ))}
                        </div>
                    </section>
                    
                    {galleryTemplates.map((category) => (
                        <section key={category.category} id={sanitizeId(category.category)}>
                            <h2 className={`text-xl font-bold mb-4 ${category.categoryColor}`}>{category.category}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {category.items.map((template) => (
                                    <TemplateCard key={template.id} template={template as any} onSelect={onNext} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}

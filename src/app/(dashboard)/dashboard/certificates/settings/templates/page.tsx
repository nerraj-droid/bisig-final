"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Plus,
    Pencil,
    Copy,
    FileText,
    Award,
    ScrollText,
    FileCheck,
    Trash2,
    Scale,
    CheckCircle
} from "lucide-react";
import { CertificateEditor } from "../../components/CertificateEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CertificateGenerator } from "../../components/CertificateGenerator";

// Template types
type TemplateType = "clearance" | "residency" | "business" | "indigency" | "cfa";

interface TemplateData {
    id: string;
    type: TemplateType;
    name: string;
    content: string;
    isDefault: boolean;
    lastModified: string;
    headerHtml?: string;
    footerHtml?: string;
    cssStyles?: string;
    showQRCode?: boolean;
    showBorder?: boolean;
    showLogo?: boolean;
}

export default function CertificateTemplatesPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null);
    const [currentEdits, setCurrentEdits] = useState<Partial<TemplateData> | null>(null);
    const editorRef = useRef<any>(null);

    useEffect(() => {
        // Load templates from localStorage
        const loadTemplates = () => {
            try {
                // Try to load all templates from the new storage format
                const savedTemplatesJson = localStorage.getItem('all-certificate-templates');
                let loadedTemplates: TemplateData[] = [];

                if (savedTemplatesJson) {
                    // If we have templates in the new format, use those
                    loadedTemplates = JSON.parse(savedTemplatesJson);
                } else {
                    // Otherwise, try to migrate from the old format
                    const certificateTypes: TemplateType[] = ["clearance", "residency", "business", "indigency", "cfa"];

                    certificateTypes.forEach(type => {
                        try {
                            const savedTemplate = localStorage.getItem(`certificate-template-${type}`);
                            if (savedTemplate) {
                                const templateData = JSON.parse(savedTemplate);
                                loadedTemplates.push({
                                    id: `template-${type}-${Date.now()}`,
                                    type: type,
                                    name: templateData.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Template`,
                                    content: templateData.content || "",
                                    isDefault: true,
                                    lastModified: new Date().toISOString(),
                                    headerHtml: templateData.headerHtml,
                                    footerHtml: templateData.footerHtml,
                                    cssStyles: templateData.cssStyles,
                                    showQRCode: templateData.showQRCode,
                                    showBorder: templateData.showBorder,
                                    showLogo: templateData.showLogo
                                });
                            }
                        } catch (err) {
                            console.error(`Error loading template for ${type}:`, err);
                        }
                    });
                }

                // Add default templates for any missing types
                const certificateTypes: TemplateType[] = ["clearance", "residency", "business", "indigency", "cfa"];
                certificateTypes.forEach(type => {
                    // Check if we have a default template for this type
                    const hasDefaultForType = loadedTemplates.some(t => t.type === type && t.isDefault);

                    if (!hasDefaultForType) {
                        loadedTemplates.push({
                            id: `template-${type}-default`,
                            type: type,
                            name: `Default ${type.charAt(0).toUpperCase() + type.slice(1)} Template`,
                            content: getDefaultContent(type),
                            isDefault: true,
                            lastModified: new Date().toISOString(),
                            showQRCode: true,
                            showBorder: true,
                            showLogo: true
                        });
                    }
                });

                setTemplates(loadedTemplates);

                // Save migrated templates in the new format
                localStorage.setItem('all-certificate-templates', JSON.stringify(loadedTemplates));
            } catch (err) {
                console.error("Error loading templates:", err);
                // If there's an error, initialize with default templates
                const certificateTypes: TemplateType[] = ["clearance", "residency", "business", "indigency", "cfa"];
                const defaultTemplates = certificateTypes.map(type => ({
                    id: `template-${type}-default`,
                    type: type,
                    name: `Default ${type.charAt(0).toUpperCase() + type.slice(1)} Template`,
                    content: getDefaultContent(type),
                    isDefault: true,
                    lastModified: new Date().toISOString(),
                    showQRCode: true,
                    showBorder: true,
                    showLogo: true
                }));

                setTemplates(defaultTemplates);
            }
        };

        loadTemplates();
    }, []);

    // Get default content based on template type
    const getDefaultContent = (type: TemplateType): string => {
        switch (type) {
            case "clearance":
                return "This is to certify that {residentName}, of legal age, {civilStatus}, Filipino, and a resident of {address} is a person of good moral character and has no derogatory record on file in this Barangay.";
            case "residency":
                return "This is to certify that {residentName}, of legal age, {civilStatus}, Filipino, is a bonafide resident of {address} for at least six (6) months.";
            case "business":
                return "This is to certify that {businessName} owned and operated by {ownerName}, located at {address} is hereby granted permission to operate within the jurisdiction of this Barangay.";
            case "indigency":
                return "This is to certify that {residentName}, of legal age, {civilStatus}, Filipino, and a resident of {address} is an INDIGENT member of this Barangay.";
            case "cfa":
                return "This is to certify that the case filed by {complainantName} against {respondentName} with case number {caseNumber} has been processed through the Katarungang Pambarangay and meets the requirements for Certification to File Action (CFA).";
            default:
                return "";
        }
    };

    // Get icon for certificate type
    const getTemplateIcon = (type: TemplateType) => {
        switch (type) {
            case "clearance":
                return <FileCheck className="h-5 w-5 text-amber-500" />;
            case "residency":
                return <Award className="h-5 w-5 text-emerald-500" />;
            case "business":
                return <ScrollText className="h-5 w-5 text-blue-500" />;
            case "indigency":
                return <FileText className="h-5 w-5 text-purple-500" />;
            case "cfa":
                return <Scale className="h-5 w-5 text-red-500" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    // Format template type for display
    const formatTemplateType = (type: TemplateType): string => {
        switch (type) {
            case "clearance":
                return "Barangay Clearance";
            case "residency":
                return "Certificate of Residency";
            case "business":
                return "Business Permit";
            case "indigency":
                return "Certificate of Indigency";
            case "cfa":
                return "Certification to File Action";
            default:
                return type;
        }
    };

    const handleCreateTemplate = (type: TemplateType) => {
        const newTemplate: TemplateData = {
            id: `template-${type}-${Date.now()}`,
            type: type,
            name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Template`,
            content: getDefaultContent(type),
            isDefault: false,
            lastModified: new Date().toISOString(),
            showQRCode: true,
            showBorder: true,
            showLogo: true
        };

        setSelectedTemplate(newTemplate);
        // Initialize current edits with the new template
        setCurrentEdits({
            name: newTemplate.name,
            content: newTemplate.content,
            headerHtml: newTemplate.headerHtml,
            footerHtml: newTemplate.footerHtml,
            cssStyles: newTemplate.cssStyles,
            showQRCode: newTemplate.showQRCode,
            showBorder: newTemplate.showBorder,
            showLogo: newTemplate.showLogo
        });
        setEditMode(true);
    };

    const handleEditTemplate = (template: TemplateData) => {
        setSelectedTemplate(template);
        // Initialize current edits with the full template
        // This ensures we have all fields available for preview
        setCurrentEdits({
            name: template.name,
            content: template.content,
            headerHtml: template.headerHtml,
            footerHtml: template.footerHtml,
            cssStyles: template.cssStyles,
            showQRCode: template.showQRCode,
            showBorder: template.showBorder,
            showLogo: template.showLogo
        });
        setEditMode(true);
    };

    const handleDuplicateTemplate = (template: TemplateData) => {
        const duplicatedTemplate: TemplateData = {
            ...template,
            id: `template-${template.type}-${Date.now()}`,
            name: `${template.name} (Copy)`,
            isDefault: false,
            lastModified: new Date().toISOString()
        };

        const updatedTemplates = [...templates, duplicatedTemplate];
        setTemplates(updatedTemplates);

        // Save the updated templates list to localStorage
        try {
            localStorage.setItem('all-certificate-templates', JSON.stringify(updatedTemplates));
        } catch (err) {
            console.error("Error duplicating template:", err);
            alert("Failed to duplicate template. Please try again.");
        }
    };

    const handleDeleteTemplate = (templateId: string) => {
        if (confirm("Are you sure you want to delete this template?")) {
            const updatedTemplates = templates.filter(t => t.id !== templateId);
            setTemplates(updatedTemplates);

            // Save the updated templates list to localStorage
            try {
                localStorage.setItem('all-certificate-templates', JSON.stringify(updatedTemplates));
            } catch (err) {
                console.error("Error deleting template:", err);
                alert("Failed to delete template. Please try again.");
            }
        }
    };

    const handleSaveTemplate = (updatedTemplate: TemplateData) => {
        // Check if this is a new template
        const isNewTemplate = !templates.some(t => t.id === updatedTemplate.id);

        let updatedTemplates: TemplateData[];

        if (isNewTemplate) {
            // Add the new template to the list
            updatedTemplates = [...templates, updatedTemplate];
        } else {
            // Update existing template
            updatedTemplates = templates.map(t =>
                t.id === updatedTemplate.id ? updatedTemplate : t
            );
        }

        // Update templates list
        setTemplates(updatedTemplates);

        // Save all templates to localStorage
        try {
            localStorage.setItem('all-certificate-templates', JSON.stringify(updatedTemplates));

            // Check if this is the default template for its type
            if (updatedTemplate.isDefault) {
                // Update the legacy storage format too for backward compatibility
                const templateData = {
                    title: updatedTemplate.name,
                    content: updatedTemplate.content,
                    headerHtml: updatedTemplate.headerHtml,
                    footerHtml: updatedTemplate.footerHtml,
                    cssStyles: updatedTemplate.cssStyles,
                    showQRCode: updatedTemplate.showQRCode,
                    showBorder: updatedTemplate.showBorder,
                    showLogo: updatedTemplate.showLogo
                };
                localStorage.setItem(`certificate-template-${updatedTemplate.type}`, JSON.stringify(templateData));
            }

            // Exit edit mode
            setEditMode(false);
            setSelectedTemplate(null);
        } catch (err) {
            console.error("Error saving template:", err);
            alert("Failed to save template. Please try again.");
        }
    };

    const handleSetAsDefault = (templateId: string, type: TemplateType) => {
        // Update all templates of this type to not be default
        const updatedTemplates = templates.map(t => {
            if (t.type === type) {
                return { ...t, isDefault: t.id === templateId };
            }
            return t;
        });

        setTemplates(updatedTemplates);

        try {
            // Save all templates to localStorage
            localStorage.setItem('all-certificate-templates', JSON.stringify(updatedTemplates));

            // Get the default template
            const defaultTemplate = updatedTemplates.find(t => t.id === templateId);
            if (defaultTemplate) {
                // Save to legacy localStorage format for compatibility
                const templateData = {
                    title: defaultTemplate.name,
                    content: defaultTemplate.content,
                    headerHtml: defaultTemplate.headerHtml,
                    footerHtml: defaultTemplate.footerHtml,
                    cssStyles: defaultTemplate.cssStyles,
                    showQRCode: defaultTemplate.showQRCode,
                    showBorder: defaultTemplate.showBorder,
                    showLogo: defaultTemplate.showLogo
                };

                localStorage.setItem(`certificate-template-${type}`, JSON.stringify(templateData));
            }
        } catch (err) {
            console.error("Error setting default template:", err);
            alert("Failed to set default template. Please try again.");
        }
    };

    // Generate sample data for preview
    const getSampleData = (type: TemplateType) => {
        const baseData = {
            residentName: "Juan Dela Cruz",
            address: "123 Main St., Sample Barangay, Metro Manila",
            purpose: "For general purposes",
            controlNumber: `SAMPLE-${Date.now().toString().slice(-6)}`,
            civilStatus: "Married",
            businessName: "",
            ownerName: "",
            officials: {
                punongBarangay: "Hon. Pedro Santos",
                secretary: "Maria Garcia",
                treasurer: "Jose Reyes"
            }
        };

        switch (type) {
            case "business":
                return {
                    ...baseData,
                    businessName: "Sample Store",
                    ownerName: "Juan Dela Cruz"
                };
            case "cfa":
                return {
                    ...baseData,
                    complainantName: "Maria Santos",
                    respondentName: "Pedro Gomez",
                    caseNumber: "CASE-2023-001"
                };
            default:
                return baseData;
        }
    };

    const handleEditorChange = (fieldName: string, value: any) => {
        setCurrentEdits(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handlePreview = (template: TemplateData) => {
        // If in edit mode, use the current edits merged with the original template
        if (editMode && selectedTemplate && selectedTemplate.id === template.id && currentEdits) {
            // Create a merged template with current edits
            const mergedTemplate = {
                ...template,
                ...currentEdits,
                // Ensure these fields are explicitly included to avoid undefined values
                name: currentEdits.name || template.name,
                content: currentEdits.content || template.content,
                headerHtml: currentEdits.headerHtml !== undefined ? currentEdits.headerHtml : template.headerHtml,
                footerHtml: currentEdits.footerHtml !== undefined ? currentEdits.footerHtml : template.footerHtml,
                cssStyles: currentEdits.cssStyles !== undefined ? currentEdits.cssStyles : template.cssStyles,
                showQRCode: currentEdits.showQRCode !== undefined ? currentEdits.showQRCode : template.showQRCode,
                showBorder: currentEdits.showBorder !== undefined ? currentEdits.showBorder : template.showBorder,
                showLogo: currentEdits.showLogo !== undefined ? currentEdits.showLogo : template.showLogo
            };

            console.log("Previewing with edits:", mergedTemplate);
            setPreviewTemplate(mergedTemplate);
        } else {
            // Regular preview, just use the template as is
            console.log("Previewing original template:", template);
            setPreviewTemplate(template);
        }
        setPreviewVisible(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/certificates">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-[#006B5E]">Certificate Templates</h1>
                </div>
                {!editMode && (
                    <Button
                        className="bg-[#006B5E] hover:bg-[#005046]"
                        onClick={() => handleCreateTemplate("clearance")}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create New Template
                    </Button>
                )}
            </div>

            {editMode && selectedTemplate ? (
                // Template Editor
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Edit Template: {selectedTemplate.name}</CardTitle>
                                <CardDescription>
                                    Customize the content and appearance of this certificate template
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => handlePreview(selectedTemplate)}
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Preview
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CertificateEditor
                            // @ts-ignore - Working around type incompatibility
                            template={selectedTemplate}
                            // @ts-ignore - Working around type incompatibility
                            onSave={handleSaveTemplate}
                            onCancel={() => {
                                setEditMode(false);
                                setSelectedTemplate(null);
                                setCurrentEdits(null);
                            }}
                            onChange={handleEditorChange}
                            ref={editorRef}
                        />
                    </CardContent>
                </Card>
            ) : (
                // Template List
                <Tabs defaultValue="all">
                    <TabsList className="mb-6">
                        <TabsTrigger value="all">All Templates</TabsTrigger>
                        <TabsTrigger value="clearance">Barangay Clearance</TabsTrigger>
                        <TabsTrigger value="residency">Residency</TabsTrigger>
                        <TabsTrigger value="business">Business</TabsTrigger>
                        <TabsTrigger value="other">Other</TabsTrigger>
                    </TabsList>

                    {["all", "clearance", "residency", "business", "other"].map((tabValue) => (
                        <TabsContent key={tabValue} value={tabValue} className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates
                                    .filter(template =>
                                        tabValue === "all" ||
                                        template.type === tabValue ||
                                        (tabValue === "other" && !["clearance", "residency", "business"].includes(template.type))
                                    )
                                    .map(template => (
                                        <Card key={template.id} className="group border overflow-hidden hover:border-[#006B5E] transition-all">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center">
                                                        {getTemplateIcon(template.type)}
                                                        <CardTitle className="ml-2 text-lg">{template.name}</CardTitle>
                                                    </div>
                                                    {template.isDefault && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" /> Default
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription>
                                                    {formatTemplateType(template.type)}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="pb-2">
                                                <div className="h-24 overflow-hidden text-sm text-gray-500 text-ellipsis">
                                                    {template.content}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-2">
                                                    Last modified: {new Date(template.lastModified).toLocaleDateString()}
                                                </div>
                                            </CardContent>

                                            <CardFooter className="flex justify-between pt-0">
                                                <div className="flex space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-[#006B5E]"
                                                        onClick={() => handleEditTemplate(template)}
                                                    >
                                                        <Pencil className="h-4 w-4 mr-1" /> Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-600"
                                                        onClick={() => handlePreview(template)}
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" /> Preview
                                                    </Button>
                                                </div>

                                                <div className="flex space-x-1">
                                                    {!template.isDefault && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-green-600"
                                                            onClick={() => handleSetAsDefault(template.id, template.type)}
                                                        >
                                                            Set as Default
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDuplicateTemplate(template)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    {!template.isDefault && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600"
                                                            onClick={() => handleDeleteTemplate(template.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))
                                }

                                {/* Add New Template Card */}
                                <Card className="border-dashed border-2 flex flex-col items-center justify-center text-center p-8 hover:border-[#006B5E] hover:bg-[#f0f9f8] transition-all cursor-pointer">
                                    <div
                                        className="flex flex-col items-center gap-2"
                                        onClick={() => handleCreateTemplate(
                                            tabValue === "all" || tabValue === "other" ? "clearance" : tabValue as TemplateType
                                        )}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[#e9f7f5] flex items-center justify-center text-[#006B5E] mb-2">
                                            <Plus size={24} />
                                        </div>
                                        <h3 className="font-medium text-lg">Create New Template</h3>
                                        <p className="text-sm text-gray-500">
                                            Add a custom template for {
                                                tabValue === "all" ? "any certificate type"
                                                    : tabValue === "other" ? "other certificate types"
                                                        : formatTemplateType(tabValue as TemplateType)
                                            }
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            )}

            {/* Preview Dialog */}
            <Dialog open={previewVisible} onOpenChange={(open) => {
                setPreviewVisible(open);
                if (!open) {
                    // When closing preview, reset preview template 
                    // to avoid stale data in next preview
                    setPreviewTemplate(null);
                }
            }}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Certificate Preview</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                        {previewTemplate && (
                            <div className="p-4">
                                <CertificateGenerator
                                    type={previewTemplate.type}
                                    data={{
                                        ...getSampleData(previewTemplate.type),
                                        templateSettings: {
                                            title: previewTemplate.name,
                                            content: previewTemplate.content,
                                            headerHtml: previewTemplate.headerHtml,
                                            footerHtml: previewTemplate.footerHtml,
                                            cssStyles: previewTemplate.cssStyles,
                                            showQRCode: previewTemplate.showQRCode,
                                            showBorder: previewTemplate.showBorder,
                                            showLogo: previewTemplate.showLogo
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 
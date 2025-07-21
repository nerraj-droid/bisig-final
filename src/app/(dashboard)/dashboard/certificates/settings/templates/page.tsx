"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
    CheckCircle,
    Upload,
    Loader2
} from "lucide-react";
import { CertificateEditor, CertificateEditorRef } from "../../components/CertificateEditor";
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

interface TemplateStats {
    total: number;
    byType: Record<TemplateType, number>;
    defaults: number;
}

export default function CertificateTemplatesPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null);
    const [currentEdits, setCurrentEdits] = useState<Partial<TemplateData> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [stats, setStats] = useState<TemplateStats>({
        total: 0,
        byType: {} as Record<TemplateType, number>,
        defaults: 0
    });
    const editorRef = useRef<CertificateEditorRef>(null);

    // Get default content based on template type
    const getDefaultContent = (type: TemplateType): string => {
        const contents = {
            clearance: "This is to certify that {residentName}, of legal age, {civilStatus}, Filipino, and a resident of {address} is a person of good moral character and has no derogatory record on file in this Barangay.",
            residency: "This is to certify that {residentName}, of legal age, {civilStatus}, Filipino, is a bonafide resident of {address} for at least six (6) months.",
            business: "This is to certify that {businessName} owned and operated by {ownerName}, located at {address} is hereby granted permission to operate within the jurisdiction of this Barangay.",
            indigency: "This is to certify that {residentName}, of legal age, {civilStatus}, Filipino, and a resident of {address} is an INDIGENT member of this Barangay.",
            cfa: "This is to certify that the case filed by {complainantName} against {respondentName} with case number {caseNumber} has been processed through the Katarungang Pambarangay and meets the requirements for Certification to File Action (CFA)."
        };
        return contents[type] || "";
    };

    // Format template type for display
    const formatTemplateType = (type: TemplateType): string => {
        const types = {
            clearance: "Barangay Clearance",
            residency: "Certificate of Residency",
            business: "Business Permit",
            indigency: "Certificate of Indigency",
            cfa: "Certification to File Action"
        };
        return types[type] || type;
    };

    // Update statistics
    const updateStats = useCallback((templateList: TemplateData[]) => {
        const byType = {} as Record<TemplateType, number>;
        const certificateTypes: TemplateType[] = ["clearance", "residency", "business", "indigency", "cfa"];

        certificateTypes.forEach(type => {
            byType[type] = templateList.filter(t => t.type === type).length;
        });

        setStats({
            total: templateList.length,
            byType,
            defaults: templateList.filter(t => t.isDefault).length
        });
    }, []);

    // Load templates from localStorage
    const loadTemplates = useCallback(async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX

            const savedTemplatesJson = localStorage.getItem('all-certificate-templates');
            let loadedTemplates: TemplateData[] = [];

            if (savedTemplatesJson) {
                loadedTemplates = JSON.parse(savedTemplatesJson);
                loadedTemplates = loadedTemplates.filter(t =>
                    t.id && t.type && t.name && typeof t.content === 'string'
                );
            }

            // Ensure we have default templates for all types
            const certificateTypes: TemplateType[] = ["clearance", "residency", "business", "indigency", "cfa"];
            certificateTypes.forEach(type => {
                const hasDefaultForType = loadedTemplates.some(t => t.type === type && t.isDefault);
                if (!hasDefaultForType) {
                    loadedTemplates.push({
                        id: `template-${type}-default-${Date.now()}`,
                        type: type,
                        name: `Default ${formatTemplateType(type)} Template`,
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
            updateStats(loadedTemplates);

            localStorage.setItem('all-certificate-templates', JSON.stringify(loadedTemplates));
            toast.success(`Successfully loaded ${loadedTemplates.length} template(s)`);
        } catch (err) {
            console.error("Error loading templates:", err);
            toast.error("Error loading templates. Using defaults instead.");

            const certificateTypes: TemplateType[] = ["clearance", "residency", "business", "indigency", "cfa"];
            const defaultTemplates = certificateTypes.map(type => ({
                id: `template-${type}-default-${Date.now()}`,
                type: type,
                name: `Default ${formatTemplateType(type)} Template`,
                content: getDefaultContent(type),
                isDefault: true,
                lastModified: new Date().toISOString(),
                showQRCode: true,
                showBorder: true,
                showLogo: true
            }));

            setTemplates(defaultTemplates);
            updateStats(defaultTemplates);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save templates to localStorage
    const saveTemplates = useCallback(async (templateList: TemplateData[]) => {
        try {
            localStorage.setItem('all-certificate-templates', JSON.stringify(templateList));

            templateList.forEach(template => {
                if (template.isDefault) {
                    const templateData = {
                        title: template.name,
                        content: template.content,
                        headerHtml: template.headerHtml,
                        footerHtml: template.footerHtml,
                        cssStyles: template.cssStyles,
                        showQRCode: template.showQRCode,
                        showBorder: template.showBorder,
                        showLogo: template.showLogo
                    };
                    localStorage.setItem(`certificate-template-${template.type}`, JSON.stringify(templateData));
                }
            });

            return true;
        } catch (err) {
            console.error("Error saving templates:", err);
            return false;
        }
    }, []);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    // Get icon for certificate type
    const getTemplateIcon = (type: TemplateType) => {
        const icons = {
            clearance: <FileCheck className="h-5 w-5 text-amber-500" />,
            residency: <Award className="h-5 w-5 text-emerald-500" />,
            business: <ScrollText className="h-5 w-5 text-blue-500" />,
            indigency: <FileText className="h-5 w-5 text-purple-500" />,
            cfa: <Scale className="h-5 w-5 text-red-500" />
        };
        return icons[type] || <FileText className="h-5 w-5" />;
    };

    const handleCreateTemplate = useCallback((type: TemplateType) => {
        const newTemplate: TemplateData = {
            id: `template-${type}-${Date.now()}`,
            type: type,
            name: `New ${formatTemplateType(type)} Template`,
            content: getDefaultContent(type),
            isDefault: false,
            lastModified: new Date().toISOString(),
            showQRCode: true,
            showBorder: true,
            showLogo: true
        };

        setSelectedTemplate(newTemplate);
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
    }, []);

    const handleEditTemplate = useCallback((template: TemplateData) => {
        setSelectedTemplate(template);
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
    }, []);

    const handleDuplicateTemplate = useCallback(async (template: TemplateData) => {
        const duplicatedTemplate: TemplateData = {
            ...template,
            id: `template-${template.type}-${Date.now()}`,
            name: `${template.name} (Copy)`,
            isDefault: false,
            lastModified: new Date().toISOString()
        };

        const updatedTemplates = [...templates, duplicatedTemplate];
        setTemplates(updatedTemplates);
        updateStats(updatedTemplates);

        const success = await saveTemplates(updatedTemplates);
        if (success) {
            toast.success(`Created a copy of "${template.name}"`);
        } else {
            toast.error("Failed to duplicate template. Please try again.");
        }
    }, [templates, saveTemplates, updateStats]);

    const handleDeleteTemplate = useCallback(async (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        if (template.isDefault) {
            toast.error("Cannot delete default templates");
            return;
        }

        if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
            const updatedTemplates = templates.filter(t => t.id !== templateId);
            setTemplates(updatedTemplates);
            updateStats(updatedTemplates);

            const success = await saveTemplates(updatedTemplates);
            if (success) {
                toast.success(`"${template.name}" has been deleted`);
            } else {
                toast.error("Failed to delete template. Please try again.");
            }
        }
    }, [templates, saveTemplates, updateStats]);

    const handleSaveTemplate = useCallback(async (updatedTemplate: TemplateData) => {
        setIsSaving(true);
        try {
            const isNewTemplate = !templates.some(t => t.id === updatedTemplate.id);
            let updatedTemplates: TemplateData[];

            if (isNewTemplate) {
                updatedTemplates = [...templates, updatedTemplate];
            } else {
                updatedTemplates = templates.map(t =>
                    t.id === updatedTemplate.id ? updatedTemplate : t
                );
            }

            setTemplates(updatedTemplates);
            updateStats(updatedTemplates);

            const success = await saveTemplates(updatedTemplates);
            if (success) {
                toast.success(`"${updatedTemplate.name}" has been saved successfully`);
                setEditMode(false);
                setSelectedTemplate(null);
                setCurrentEdits(null);
            } else {
                throw new Error("Failed to save to localStorage");
            }
        } catch (err) {
            console.error("Error saving template:", err);
            toast.error("Failed to save template. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }, [templates, saveTemplates, updateStats]);

    const handleSetAsDefault = useCallback(async (templateId: string, type: TemplateType) => {
        const updatedTemplates = templates.map(t => {
            if (t.type === type) {
                return { ...t, isDefault: t.id === templateId };
            }
            return t;
        });

        setTemplates(updatedTemplates);
        updateStats(updatedTemplates);

        const success = await saveTemplates(updatedTemplates);
        if (success) {
            const template = templates.find(t => t.id === templateId);
            toast.success(`"${template?.name}" is now the default template for ${formatTemplateType(type)}`);
        } else {
            toast.error("Failed to set default template. Please try again.");
        }
    }, [templates, saveTemplates, updateStats]);

    // Generate sample data for preview
    const getSampleData = useCallback((type: TemplateType) => {
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
    }, []);

    const handleEditorChange = useCallback((fieldName: string, value: any) => {
        setCurrentEdits(prev => ({
            ...prev,
            [fieldName]: value
        }));
    }, []);

    const handlePreview = useCallback((template: TemplateData) => {
        let templateToPreview = template;

        if (editMode && selectedTemplate && selectedTemplate.id === template.id && currentEdits) {
            templateToPreview = {
                ...template,
                ...currentEdits,
                name: currentEdits.name || template.name,
                content: currentEdits.content || template.content,
                headerHtml: currentEdits.headerHtml !== undefined ? currentEdits.headerHtml : template.headerHtml,
                footerHtml: currentEdits.footerHtml !== undefined ? currentEdits.footerHtml : template.footerHtml,
                cssStyles: currentEdits.cssStyles !== undefined ? currentEdits.cssStyles : template.cssStyles,
                showQRCode: currentEdits.showQRCode !== undefined ? currentEdits.showQRCode : template.showQRCode,
                showBorder: currentEdits.showBorder !== undefined ? currentEdits.showBorder : template.showBorder,
                showLogo: currentEdits.showLogo !== undefined ? currentEdits.showLogo : template.showLogo
            };
        }

        setPreviewTemplate(templateToPreview);
        setPreviewVisible(true);
    }, [editMode, selectedTemplate, currentEdits]);

    const handleCancelEdit = useCallback(() => {
        setEditMode(false);
        setSelectedTemplate(null);
        setCurrentEdits(null);
    }, []);

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading templates...</span>
                    </div>
                </div>
            </div>
        );
    }

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
                    <div>
                        <h1 className="text-3xl font-bold text-[#006B5E]">Certificate Templates</h1>
                        <p className="text-muted-foreground">
                            Manage and customize certificate templates for your barangay
                        </p>
                    </div>
                </div>
                {!editMode && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => loadTemplates()}
                            disabled={isLoading}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button
                            className="bg-[#006B5E] hover:bg-[#005046]"
                            onClick={() => handleCreateTemplate("clearance")}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Create New Template
                        </Button>
                    </div>
                )}
            </div>

            {/* Statistics Cards */}
            {!editMode && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Total Templates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#006B5E]">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Clearance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.byType.clearance || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Residency</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.byType.residency || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Business</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.byType.business || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Other</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {(stats.byType.indigency || 0) + (stats.byType.cfa || 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

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
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePreview(selectedTemplate)}
                                    className="flex items-center gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    Preview
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CertificateEditor
                            template={selectedTemplate as any}
                            onSave={(template) => {
                                handleSaveTemplate(template as TemplateData);
                            }}
                            onCancel={handleCancelEdit}
                            onChange={handleEditorChange}
                            ref={editorRef}
                        />
                        {isSaving && (
                            <div className="flex items-center justify-center mt-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving template...
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                // Template List
                <Tabs defaultValue="all">
                    <TabsList className="mb-6">
                        <TabsTrigger value="all">All Templates ({stats.total})</TabsTrigger>
                        <TabsTrigger value="clearance">Barangay Clearance ({stats.byType.clearance || 0})</TabsTrigger>
                        <TabsTrigger value="residency">Residency ({stats.byType.residency || 0})</TabsTrigger>
                        <TabsTrigger value="business">Business ({stats.byType.business || 0})</TabsTrigger>
                        <TabsTrigger value="other">Other ({(stats.byType.indigency || 0) + (stats.byType.cfa || 0)})</TabsTrigger>
                    </TabsList>

                    {["all", "clearance", "residency", "business", "other"].map((tabValue) => (
                        <TabsContent key={tabValue} value={tabValue} className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates
                                    .filter(template =>
                                        tabValue === "all" ||
                                        template.type === tabValue ||
                                        (tabValue === "other" && ["indigency", "cfa"].includes(template.type))
                                    )
                                    .map(template => (
                                        <Card key={template.id} className="group border overflow-hidden hover:border-[#006B5E] transition-all">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center">
                                                        {getTemplateIcon(template.type)}
                                                        <CardTitle className="ml-2 text-lg break-words whitespace-normal">{template.name}</CardTitle>
                                                    </div>

                                                </div>
                                                {template.isDefault && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1 shrink-0">
                                                            <CheckCircle className="h-3 w-3" /> Default
                                                        </Badge>
                                                    )}
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

                                            <CardFooter className="flex justify-between pt-0 gap-2">
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
                                                            Set Default
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
                                <Card className="border-dashed border-2 flex flex-col items-center justify-center text-center p-8 hover:border-[#006B5E] hover:bg-[#f0f9f8] transition-all cursor-pointer min-h-[300px]">
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
                    setPreviewTemplate(null);
                }
            }}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Certificate Preview - {previewTemplate?.name}</DialogTitle>
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
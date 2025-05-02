"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, X, FileText, Layout, Image, Code } from "lucide-react";

interface TemplateData {
  id: string;
  type: string;
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

interface CertificateEditorProps {
  template: TemplateData;
  onSave: (updatedTemplate: TemplateData) => void;
  onCancel: () => void;
  onChange?: (field: string, value: any) => void;
}

export interface CertificateEditorRef {
  getCurrentValues: () => TemplateData;
}

export const CertificateEditor = forwardRef<CertificateEditorRef, CertificateEditorProps>(
  ({ template, onSave, onCancel, onChange }, ref) => {
    const [editedTemplate, setEditedTemplate] = useState<TemplateData>({
      ...template,
      lastModified: new Date().toISOString()
    });

    // Expose the current values to the parent component
    useImperativeHandle(ref, () => ({
      getCurrentValues: () => editedTemplate
    }));

    const handleChange = (field: keyof TemplateData, value: any) => {
      const updatedTemplate = {
        ...editedTemplate,
        [field]: value
      };

      setEditedTemplate(updatedTemplate);

      // Call parent onChange if provided
      if (onChange) {
        onChange(field, value);
      }
    };

    const handleSave = () => {
      onSave(editedTemplate);
    };

    return (
      <div className="space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText size={16} />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout size={16} />
              <span>Layout</span>
            </TabsTrigger>
            <TabsTrigger value="header-footer" className="flex items-center gap-2">
              <Image size={16} />
              <span>Header & Footer</span>
            </TabsTrigger>
            <TabsTrigger value="styles" className="flex items-center gap-2">
              <Code size={16} />
              <span>Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Template Content</CardTitle>
                <CardDescription>
                  Edit the basic information and content of your certificate template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={editedTemplate.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter a name for this template"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="template-content">Certificate Content</Label>
                  <Textarea
                    id="template-content"
                    value={editedTemplate.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    placeholder="Enter the main content of the certificate"
                    className="min-h-[200px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Use the following placeholders in your content:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    <li>{'{residentName}'} - The resident's full name</li>
                    <li>{'{address}'} - The resident's address</li>
                    <li>{'{purpose}'} - The purpose of the certificate</li>
                    <li>{'{civilStatus}'} - Civil status (single, married, etc.)</li>
                    <li>{'{businessName}'} - For business certificates</li>
                    <li>{'{ownerName}'} - For business certificates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout Options Tab */}
          <TabsContent value="layout" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Layout Options</CardTitle>
                <CardDescription>
                  Customize the appearance and layout settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-border">Show Border</Label>
                      <p className="text-sm text-muted-foreground">
                        Add a border around the certificate
                      </p>
                    </div>
                    <Switch
                      id="show-border"
                      checked={editedTemplate.showBorder}
                      onCheckedChange={(checked) => handleChange("showBorder", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-logo">Show Barangay Logo</Label>
                      <p className="text-sm text-muted-foreground">
                        Display the barangay logo in the header
                      </p>
                    </div>
                    <Switch
                      id="show-logo"
                      checked={editedTemplate.showLogo}
                      onCheckedChange={(checked) => handleChange("showLogo", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-qrcode">Show QR Code</Label>
                      <p className="text-sm text-muted-foreground">
                        Display QR code for certificate verification
                      </p>
                    </div>
                    <Switch
                      id="show-qrcode"
                      checked={editedTemplate.showQRCode}
                      onCheckedChange={(checked) => handleChange("showQRCode", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Header & Footer Tab */}
          <TabsContent value="header-footer" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Header and Footer</CardTitle>
                <CardDescription>
                  Customize the header and footer content of your certificate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="header-html">Header HTML</Label>
                  <Textarea
                    id="header-html"
                    value={editedTemplate.headerHtml || ""}
                    onChange={(e) => handleChange("headerHtml", e.target.value)}
                    placeholder="<div class='text-center'>Custom header HTML</div>"
                    className="min-h-[100px] font-mono text-sm"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="footer-html">Footer HTML</Label>
                  <Textarea
                    id="footer-html"
                    value={editedTemplate.footerHtml || ""}
                    onChange={(e) => handleChange("footerHtml", e.target.value)}
                    placeholder="<div class='text-center'>Custom footer HTML</div>"
                    className="min-h-[100px] font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Styles Tab */}
          <TabsContent value="styles" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Styling</CardTitle>
                <CardDescription>
                  Add custom CSS styles to your certificate template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="css-styles">Custom CSS</Label>
                  <Textarea
                    id="css-styles"
                    value={editedTemplate.cssStyles || ""}
                    onChange={(e) => handleChange("cssStyles", e.target.value)}
                    placeholder=".certificate-header { font-size: 24px; }"
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add custom CSS styles to further customize your certificate appearance
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="gap-1">
            <X size={16} /> Cancel
          </Button>
          <Button onClick={handleSave} className="gap-1 bg-[#006B5E] hover:bg-[#005046]">
            <Save size={16} /> Save Template
          </Button>
        </div>
      </div>
    );
  }
); 
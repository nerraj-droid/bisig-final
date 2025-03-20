"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Save, RefreshCw, FileText, Layout, Type, Image as ImageIcon, Signature } from "lucide-react";

interface CertificateEditorProps {
  initialData: any;
  onSave: (data: any) => void;
  onPreview: () => void;
  certificateType: string;
}

export function CertificateEditor({ initialData, onSave, onPreview, certificateType }: CertificateEditorProps) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState("content");

  const handleChange = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(data);
  };

  const getCertificateTitle = () => {
    switch (certificateType) {
      case "clearance":
        return "Barangay Clearance";
      case "residency":
        return "Certificate of Residency";
      case "indigency":
        return "Certificate of Indigency";
      case "business":
        return "Business Permit";
      default:
        return "Certificate";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium">Edit {getCertificateTitle()} Template</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPreview}>
            <FileText className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-200">
          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger
              value="content"
              className={`px-4 py-3 rounded-none border-b-2 ${activeTab === "content" ? "border-[#006B5E] text-[#006B5E]" : "border-transparent"
                }`}
            >
              <Type className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger
              value="layout"
              className={`px-4 py-3 rounded-none border-b-2 ${activeTab === "layout" ? "border-[#006B5E] text-[#006B5E]" : "border-transparent"
                }`}
            >
              <Layout className="mr-2 h-4 w-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className={`px-4 py-3 rounded-none border-b-2 ${activeTab === "images" ? "border-[#006B5E] text-[#006B5E]" : "border-transparent"
                }`}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger
              value="signatures"
              className={`px-4 py-3 rounded-none border-b-2 ${activeTab === "signatures" ? "border-[#006B5E] text-[#006B5E]" : "border-transparent"
                }`}
            >
              <Signature className="mr-2 h-4 w-4" />
              Signatures
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          <TabsContent value="content" className="mt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Certificate Title</Label>
                  <Input
                    id="title"
                    value={data.title || ""}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Certificate Title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Certificate <span className="text-red-500">*</span></Label>
                  <Select
                    value={data.purpose || ""}
                    onValueChange={(value) => handleChange("purpose", value)}
                  >
                    <SelectTrigger id="purpose">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYMENT">Employment</SelectItem>
                      <SelectItem value="SCHOOL_REQUIREMENT">School Requirement</SelectItem>
                      <SelectItem value="BANK_REQUIREMENT">Bank Requirement</SelectItem>
                      <SelectItem value="GOVERNMENT_ID">Government ID Application</SelectItem>
                      <SelectItem value="LOAN_APPLICATION">Loan Application</SelectItem>
                      <SelectItem value="MEDICAL_ASSISTANCE">Medical Assistance</SelectItem>
                      <SelectItem value="POLICE_CLEARANCE">Police Clearance</SelectItem>
                      <SelectItem value="NBI_CLEARANCE">NBI Clearance</SelectItem>
                      <SelectItem value="PASSPORT_APPLICATION">Passport Application</SelectItem>
                      <SelectItem value="BUSINESS_PERMIT">Business Permit</SelectItem>
                      <SelectItem value="SCHOLARSHIP">Scholarship</SelectItem>
                      <SelectItem value="OTHERS">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  {data.purpose === "OTHERS" && (
                    <Input
                      id="customPurpose"
                      value={data.customPurpose || ""}
                      onChange={(e) => handleChange("customPurpose", e.target.value)}
                      placeholder="Specify other purpose"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Certificate Content</Label>
                <Textarea
                  id="content"
                  value={data.content || ""}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="Main content of the certificate"
                  rows={6}
                />
                <p className="text-xs text-gray-500">
                  You can use placeholders like {"{residentName}"}, {"{address}"}, etc. which will be replaced with actual data.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer">Certificate Footer</Label>
                <Textarea
                  id="footer"
                  value={data.footer || ""}
                  onChange={(e) => handleChange("footer", e.target.value)}
                  placeholder="Footer text"
                  rows={2}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="mt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paperSize">Paper Size</Label>
                  <Select
                    value={data.paperSize || "letter"}
                    onValueChange={(value) => handleChange("paperSize", value)}
                  >
                    <SelectTrigger id="paperSize">
                      <SelectValue placeholder="Select paper size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="letter">Letter (8.5" x 11")</SelectItem>
                      <SelectItem value="a4">A4 (210mm x 297mm)</SelectItem>
                      <SelectItem value="legal">Legal (8.5" x 14")</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orientation">Orientation</Label>
                  <Select
                    value={data.orientation || "portrait"}
                    onValueChange={(value) => handleChange("orientation", value)}
                  >
                    <SelectTrigger id="orientation">
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Margins (mm)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="marginTop" className="text-xs">Top</Label>
                    <Input
                      id="marginTop"
                      type="number"
                      value={data.margins?.top || 20}
                      onChange={(e) => handleNestedChange("margins", "top", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="marginRight" className="text-xs">Right</Label>
                    <Input
                      id="marginRight"
                      type="number"
                      value={data.margins?.right || 20}
                      onChange={(e) => handleNestedChange("margins", "right", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="marginBottom" className="text-xs">Bottom</Label>
                    <Input
                      id="marginBottom"
                      type="number"
                      value={data.margins?.bottom || 20}
                      onChange={(e) => handleNestedChange("margins", "bottom", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="marginLeft" className="text-xs">Left</Label>
                    <Input
                      id="marginLeft"
                      type="number"
                      value={data.margins?.left || 20}
                      onChange={(e) => handleNestedChange("margins", "left", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showBorder">Show Border</Label>
                  <Switch
                    id="showBorder"
                    checked={data.showBorder || false}
                    onCheckedChange={(checked) => handleChange("showBorder", checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Border Width (px)</Label>
                <Slider
                  disabled={!data.showBorder}
                  value={[data.borderWidth || 1]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => handleChange("borderWidth", value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Thin (1px)</span>
                  <span>Thick (10px)</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showLogo">Show Barangay Logo</Label>
                  <Switch
                    id="showLogo"
                    checked={data.showLogo || true}
                    onCheckedChange={(checked) => handleChange("showLogo", checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={data.logoUrl || ""}
                  onChange={(e) => handleChange("logoUrl", e.target.value)}
                  placeholder="URL to logo image"
                  disabled={!data.showLogo}
                />
                <p className="text-xs text-gray-500">
                  Enter the URL of your barangay logo. Recommended size: 200x200px.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showWatermark">Show Watermark</Label>
                  <Switch
                    id="showWatermark"
                    checked={data.showWatermark || false}
                    onCheckedChange={(checked) => handleChange("showWatermark", checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="watermarkUrl">Watermark URL</Label>
                <Input
                  id="watermarkUrl"
                  value={data.watermarkUrl || ""}
                  onChange={(e) => handleChange("watermarkUrl", e.target.value)}
                  placeholder="URL to watermark image"
                  disabled={!data.showWatermark}
                />
                <p className="text-xs text-gray-500">
                  Enter the URL of your watermark image. This will appear faded in the background.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Watermark Opacity</Label>
                <Slider
                  disabled={!data.showWatermark}
                  value={[data.watermarkOpacity || 0.1]}
                  min={0.05}
                  max={0.3}
                  step={0.05}
                  onValueChange={(value) => handleChange("watermarkOpacity", value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Light (5%)</span>
                  <span>Dark (30%)</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signatures" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showSignatures">Show Signatures</Label>
                  <Switch
                    id="showSignatures"
                    checked={data.showSignatures || true}
                    onCheckedChange={(checked) => handleChange("showSignatures", checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="punongBarangay">Punong Barangay</Label>
                  <Input
                    id="punongBarangay"
                    value={data.officials?.punongBarangay || ""}
                    onChange={(e) => handleNestedChange("officials", "punongBarangay", e.target.value)}
                    placeholder="Name of Punong Barangay"
                    disabled={!data.showSignatures}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="punongBarangaySignature">Signature URL</Label>
                  <Input
                    id="punongBarangaySignature"
                    value={data.signatures?.punongBarangay || ""}
                    onChange={(e) => handleNestedChange("signatures", "punongBarangay", e.target.value)}
                    placeholder="URL to signature image"
                    disabled={!data.showSignatures}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secretary">Barangay Secretary</Label>
                  <Input
                    id="secretary"
                    value={data.officials?.secretary || ""}
                    onChange={(e) => handleNestedChange("officials", "secretary", e.target.value)}
                    placeholder="Name of Secretary"
                    disabled={!data.showSignatures}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretarySignature">Signature URL</Label>
                  <Input
                    id="secretarySignature"
                    value={data.signatures?.secretary || ""}
                    onChange={(e) => handleNestedChange("signatures", "secretary", e.target.value)}
                    placeholder="URL to signature image"
                    disabled={!data.showSignatures}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showQRCode">Show QR Code</Label>
                  <Switch
                    id="showQRCode"
                    checked={data.showQRCode || true}
                    onCheckedChange={(checked) => handleChange("showQRCode", checked)}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  QR code will be generated automatically for certificate verification.
                </p>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="p-4 border-t border-gray-200 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => setData(initialData)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset to Default
        </Button>
        <Button size="sm" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
} 
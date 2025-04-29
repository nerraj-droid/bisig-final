"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Award, Calendar, ChevronsUpDown, FileText } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function GenerateCertificatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [certificateType, setCertificateType] = useState("");
  const [resident, setResident] = useState("");
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [purpose, setPurpose] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  // Mock data for residents
  const residents = [
    { value: "juan-dela-cruz", label: "Juan Dela Cruz" },
    { value: "maria-santos", label: "Maria Santos" },
    { value: "pedro-reyes", label: "Pedro Reyes" },
    { value: "ana-magtanggol", label: "Ana Magtanggol" },
    { value: "roberto-lim", label: "Roberto Lim" }
  ];

  // Certificate types
  const certificateTypes = [
    { value: "barangay-clearance", label: "Barangay Clearance" },
    { value: "certificate-of-residency", label: "Certificate of Residency" },
    { value: "business-permit", label: "Business Permit" },
    { value: "indigency-certificate", label: "Indigency Certificate" },
    { value: "certification-to-file-action", label: "Certification to File Action" }
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Submit the form and process the certificate generation
      alert("Certificate generated successfully!");
      router.push("/dashboard/certificates/search");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2 p-0 h-8 w-8" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-[#006B5E]">Generate Certificate</h1>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-[#006B5E] text-white" : "bg-gray-200 text-gray-500"}`}>1</div>
            <div className={`h-1 w-8 ${step >= 2 ? "bg-[#006B5E]" : "bg-gray-200"}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-[#006B5E] text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
            <div className={`h-1 w-8 ${step >= 3 ? "bg-[#006B5E]" : "bg-gray-200"}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? "bg-[#006B5E] text-white" : "bg-gray-200 text-gray-500"}`}>3</div>
          </div>
          <div className="text-sm text-gray-500">
            {step === 1 ? "Select Certificate Type" : step === 2 ? "Resident Information" : "Purpose & Details"}
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Award className="mr-2 h-5 w-5" /> Generate Certificate
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? "Select the type of certificate you want to generate"
              : step === 2 
                ? "Select the resident and specify the date"
                : "Enter the purpose and any additional details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="certificate-type">Certificate Type</Label>
                <Select value={certificateType} onValueChange={setCertificateType}>
                  <SelectTrigger id="certificate-type">
                    <SelectValue placeholder="Select certificate type" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificateTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Choose the type of certificate you need to generate for the resident
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="resident">Resident</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {resident
                        ? residents.find((r) => r.value === resident)?.label
                        : "Select resident..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search resident..." />
                      <CommandEmpty>No resident found.</CommandEmpty>
                      <CommandGroup>
                        {residents.map((r) => (
                          <CommandItem
                            key={r.value}
                            value={r.value}
                            onSelect={(currentValue) => {
                              setResident(currentValue === resident ? "" : currentValue);
                              setOpen(false);
                            }}
                          >
                            {r.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-500 mt-1">
                  Select the resident who will receive this certificate
                </p>
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-500 mt-1">
                  Select the date when the certificate will be issued
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  placeholder="Employment, School Enrollment, etc."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Specify the purpose for which this certificate will be used
                </p>
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="details">Additional Details</Label>
                <Textarea
                  id="details"
                  placeholder="Enter any additional information needed for this certificate..."
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add any specific details or requirements for this certificate (optional)
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleBack}>
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={
                (step === 1 && !certificateType) ||
                (step === 2 && (!resident || !date)) ||
                (step === 3 && !purpose)
              }
            >
              {step < 3 ? "Next" : "Generate Certificate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Certificate Information</CardTitle>
            <CardDescription>
              Details about the selected certificate type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {certificateType ? (
              <div className="space-y-2">
                <h3 className="font-semibold">
                  {certificateTypes.find(t => t.value === certificateType)?.label}
                </h3>
                <p className="text-sm">
                  {certificateType === "barangay-clearance" && 
                    "A Barangay Clearance is a document issued by the Barangay to certify that the resident has no derogatory record in the barangay."}
                  {certificateType === "certificate-of-residency" && 
                    "A Certificate of Residency confirms that the person is a bona fide resident of the barangay."}
                  {certificateType === "business-permit" && 
                    "A Business Permit authorizes a person or entity to operate a business within the barangay's jurisdiction."}
                  {certificateType === "indigency-certificate" && 
                    "An Indigency Certificate attests that the resident belongs to the low-income group and cannot afford to pay certain fees."}
                  {certificateType === "certification-to-file-action" && 
                    "A Certification to File Action is required before filing a case in court, showing that a conciliation process was attempted at the barangay level."}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Required information: Resident details, Valid ID, Purpose of request
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Select a certificate type to view its information
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
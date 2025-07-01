"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    FileText,
    Calendar,
    User,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { CertificateType } from "@prisma/client";

interface Certificate {
    id: string;
    purpose: string;
    controlNumber: string;
    status: string;
    issuedDate: Date | null;
    createdAt: Date;
    type: CertificateType;
    Resident: {
        id: string;
        firstName: string;
        middleName: string | null;
        lastName: string;
        address: string;
    };
    Officials: {
        punongBarangay: string;
        secretary: string | null;
        treasurer: string | null;
    };
}

interface CertificateStats {
    total: number;
    pending: number;
    released: number;
    byType: Array<{
        type: CertificateType;
        count: number;
    }>;
}

export default function CertificateManagePage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [stats, setStats] = useState<CertificateStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState("");

    // Load certificates and stats
    useEffect(() => {
        loadCertificates();
        loadStats();
    }, []);

    const loadCertificates = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/certificates');

            if (!response.ok) {
                throw new Error('Failed to fetch certificates');
            }

            const data = await response.json();
            setCertificates(data);
        } catch (error) {
            console.error('Error loading certificates:', error);
            toast.error('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch('/api/certificates?stats=true');

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    // Filter certificates
    const filteredCertificates = certificates.filter(cert => {
        const matchesSearch =
            cert.controlNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${cert.Resident.firstName} ${cert.Resident.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cert.purpose.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || cert.status === statusFilter;
        const matchesType = typeFilter === "ALL" || cert.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    // Handle status update
    const handleStatusUpdate = async () => {
        if (!selectedCertificate || !newStatus) return;

        try {
            const response = await fetch(`/api/certificates/${selectedCertificate.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    issuedDate: newStatus === 'RELEASED' ? new Date().toISOString() : null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update certificate');
            }

            toast.success('Certificate status updated successfully');
            setIsUpdateDialogOpen(false);
            setSelectedCertificate(null);
            setNewStatus("");
            loadCertificates();
            loadStats();
        } catch (error) {
            console.error('Error updating certificate:', error);
            toast.error('Failed to update certificate status');
        }
    };

    // Handle delete certificate
    const handleDeleteCertificate = async (certificateId: string) => {
        try {
            const response = await fetch(`/api/certificates/${certificateId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete certificate');
            }

            toast.success('Certificate deleted successfully');
            loadCertificates();
            loadStats();
        } catch (error) {
            console.error('Error deleting certificate:', error);
            toast.error('Failed to delete certificate');
        }
    };

    // Format certificate type
    const formatCertificateType = (type: CertificateType) => {
        const typeMap = {
            CLEARANCE: 'Barangay Clearance',
            RESIDENCY: 'Certificate of Residency',
            BUSINESS_PERMIT: 'Business Permit',
            INDIGENCY: 'Certificate of Indigency',
            CFA: 'Certification to File Action',
        };
        return typeMap[type] || type;
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            APPROVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
            RELEASED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
            CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] ||
            { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };

        const Icon = config.icon;

        return (
            <Badge className={`${config.color} px-2 py-1`}>
                <Icon className="w-3 h-3 mr-1" />
                {status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006B5E] mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading certificates...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#006B5E]">Certificate Management</h1>
                    <p className="text-gray-600">Manage and track all certificate requests</p>
                </div>
                <Button
                    onClick={() => window.location.href = '/dashboard/certificates/new'}
                    className="bg-[#006B5E] hover:bg-[#005046]"
                >
                    <FileText className="w-4 h-4 mr-2" />
                    New Certificate
                </Button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Certificates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#006B5E]">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Released</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.released}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.total > 0 ? Math.round((stats.released / stats.total) * 100) : 0}%
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by control number, resident name, or purpose..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="RELEASED">Released</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                <SelectItem value="CLEARANCE">Barangay Clearance</SelectItem>
                                <SelectItem value="RESIDENCY">Certificate of Residency</SelectItem>
                                <SelectItem value="BUSINESS_PERMIT">Business Permit</SelectItem>
                                <SelectItem value="INDIGENCY">Certificate of Indigency</SelectItem>
                                <SelectItem value="CFA">Certification to File Action</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Certificates Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Certificates ({filteredCertificates.length})</CardTitle>
                    <CardDescription>
                        Manage certificate requests and their status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Control Number</TableHead>
                                    <TableHead>Resident</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCertificates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            No certificates found matching your criteria
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCertificates.map((certificate) => (
                                        <TableRow key={certificate.id}>
                                            <TableCell className="font-mono text-sm">
                                                {certificate.controlNumber}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {certificate.Resident.firstName} {certificate.Resident.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {certificate.Resident.address}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {formatCertificateType(certificate.type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {certificate.purpose}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(certificate.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {format(new Date(certificate.createdAt), 'MMM d, yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedCertificate(certificate);
                                                            setNewStatus(certificate.status);
                                                            setIsUpdateDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this certificate? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteCertificate(certificate.id)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Update Status Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Certificate Status</DialogTitle>
                        <DialogDescription>
                            Change the status of certificate {selectedCertificate?.controlNumber}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="RELEASED">Released</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsUpdateDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStatusUpdate}
                            className="bg-[#006B5E] hover:bg-[#005046]"
                        >
                            Update Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 
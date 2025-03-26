"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Save, ArrowUpDown, Loader2 } from "lucide-react"

interface CouncilMember {
    id: string
    name: string
    position: string
    imageUrl: string | null
    order: number
    signature: string | null
    isActive: boolean
}

interface CouncilMemberListProps {
    councilMembers: CouncilMember[]
}

export function CouncilMemberList({ councilMembers: initialCouncilMembers }: CouncilMemberListProps) {
    const router = useRouter()
    const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>(initialCouncilMembers)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentMember, setCurrentMember] = useState<CouncilMember | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        imageUrl: '',
        signature: '',
        isActive: true,
    })
    const [loading, setLoading] = useState(false)

    const handleAddNew = () => {
        setIsEditing(false)
        setFormData({
            name: '',
            position: '',
            imageUrl: '',
            signature: '',
            isActive: true,
        })
        setIsDialogOpen(true)
    }

    const handleEdit = (member: CouncilMember) => {
        setIsEditing(true)
        setCurrentMember(member)
        setFormData({
            name: member.name,
            position: member.position,
            imageUrl: member.imageUrl || '',
            signature: member.signature || '',
            isActive: member.isActive,
        })
        setIsDialogOpen(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isEditing && currentMember) {
                // Update existing member
                const res = await fetch(`/api/certificates/council-members/${currentMember.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                })

                if (!res.ok) {
                    throw new Error('Failed to update council member')
                }

                toast.success('Council member updated successfully')
            } else {
                // Create new member
                const res = await fetch('/api/certificates/council-members', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        order: councilMembers.length // Add at the end
                    }),
                })

                if (!res.ok) {
                    throw new Error('Failed to create council member')
                }

                toast.success('Council member added successfully')
            }

            // Close dialog and refresh
            setIsDialogOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error saving council member:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to save council member')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this council member?')) {
            return
        }

        setLoading(true)

        try {
            const res = await fetch(`/api/certificates/council-members/${id}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                throw new Error('Failed to delete council member')
            }

            toast.success('Council member deleted successfully')
            router.refresh()
        } catch (error) {
            console.error('Error deleting council member:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to delete council member')
        } finally {
            setLoading(false)
        }
    }

    const handleMoveUp = async (id: string, currentOrder: number) => {
        if (currentOrder <= 0) return

        try {
            const res = await fetch(`/api/certificates/council-members/${id}/reorder`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newOrder: currentOrder - 1 }),
            })

            if (!res.ok) {
                throw new Error('Failed to reorder council member')
            }

            toast.success('Member order updated')
            router.refresh()
        } catch (error) {
            console.error('Error reordering council member:', error)
            toast.error('Failed to change order')
        }
    }

    const handleMoveDown = async (id: string, currentOrder: number) => {
        if (currentOrder >= councilMembers.length - 1) return

        try {
            const res = await fetch(`/api/certificates/council-members/${id}/reorder`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newOrder: currentOrder + 1 }),
            })

            if (!res.ok) {
                throw new Error('Failed to reorder council member')
            }

            toast.success('Member order updated')
            router.refresh()
        } catch (error) {
            console.error('Error reordering council member:', error)
            toast.error('Failed to change order')
        }
    }

    return (
        <div>
            <Card className="shadow-none border-0">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Council Members</CardTitle>
                            <CardDescription>
                                Manage your barangay officials and council members for certificates
                            </CardDescription>
                        </div>
                        <Button
                            onClick={handleAddNew}
                            className="bg-[#006B5E] hover:bg-[#005046]"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Member
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {councilMembers.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {councilMembers.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="w-24">
                                            <div className="flex items-center space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleMoveUp(member.id, member.order)}
                                                    disabled={member.order === 0}
                                                    className="h-7 w-7"
                                                >
                                                    <ArrowUpDown className="h-4 w-4 rotate-90" />
                                                </Button>
                                                <span>{member.order + 1}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleMoveDown(member.id, member.order)}
                                                    disabled={member.order === councilMembers.length - 1}
                                                    className="h-7 w-7"
                                                >
                                                    <ArrowUpDown className="h-4 w-4 -rotate-90" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell>{member.position}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {member.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(member)}
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(member.id)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No council members found. Click the button above to add one.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Council Member' : 'Add New Council Member'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the information for this council member.'
                                : 'Add a new council member to your barangay.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="position" className="text-right">
                                    Position
                                </Label>
                                <Input
                                    id="position"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="imageUrl" className="text-right">
                                    Image URL
                                </Label>
                                <Input
                                    id="imageUrl"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="col-span-3"
                                    placeholder="URL to profile photo (optional)"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="signature" className="text-right">
                                    Signature URL
                                </Label>
                                <Input
                                    id="signature"
                                    name="signature"
                                    value={formData.signature}
                                    onChange={handleChange}
                                    className="col-span-3"
                                    placeholder="URL to signature image (optional)"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="isActive" className="text-right">
                                    Status
                                </Label>
                                <div className="col-span-3 flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="isActive" className="text-sm font-normal">
                                        Active
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-[#006B5E] hover:bg-[#005046]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
} 
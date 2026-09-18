import { useState, useRef } from 'react'
import { useSession } from '../../../hooks/useSession'
import { useAvatar, useUploadAvatar } from '../../../hooks/useAvatar'
import { useNotificationPreferences, useUpdateNotificationPreferences, useUpdateProfileName, useUpdatePassword } from '../../../hooks/useSettings'
import { useDataExport } from '../../../hooks/useDataExport'
import { useAccountDeletion, useAccountRestore } from '../../../hooks/useAccountDeletion'
import { useDemoMode } from '../../../hooks/useDemoMode'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { toast } from 'sonner'
import { Download, Trash2, Undo2, User, Bell, FileDown, AlertTriangle, LogOut, TestTube, Camera } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { authClient } from '../../../lib/auth-client'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'export', label: 'Data Export', icon: FileDown },
  { id: 'demo', label: 'Demo Mode', icon: TestTube },
  { id: 'danger', label: 'Close Account', icon: AlertTriangle },
] as const

type TabId = typeof TABS[number]['id']

export default function SettingsPage() {
  const { data: session } = useSession()
  const user = session?.user
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#2d3a2a]">Settings</h1>
        <p className="mt-1 text-sm text-[#6a7a65]">Manage your account and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} orientation="horizontal">
        <TabsList variant="line" className="mb-6 w-full overflow-x-auto">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="whitespace-nowrap">
              <tab.icon className="size-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <div className="p-1">
            <ProfileSection user={user} />
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="p-1">
            <NotificationsSection />
          </div>
        </TabsContent>

        <TabsContent value="export">
          <div className="p-1">
            <ExportSection />
          </div>
        </TabsContent>

        <TabsContent value="demo">
          <div className="p-1">
            <DemoModeSection />
          </div>
        </TabsContent>

        <TabsContent value="danger">
          <div className="p-1">
            <DangerSection userId={user?.id} banned={(user as any)?.banned} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between rounded-xl border border-[#e8e6dd] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <LogOut className="size-5 text-[#6a7a65]" />
          <div>
            <p className="font-body text-sm font-medium text-[#2d3a2a]">Sign Out</p>
            <p className="font-body text-xs text-[#6a7a65]">Sign out of your account</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-[#e8e6dd] px-4 py-2 font-body text-sm text-[#2d3a2a] transition-colors hover:bg-[#fae8e8] hover:border-[#c0392b]/30"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

function ProfileSection({ user }: { user: { id: string; name?: string | null; email?: string | null; image?: string | null } | undefined }) {
  const [name, setName] = useState(user?.name ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const updateName = useUpdateProfileName()
  const updatePassword = useUpdatePassword()

  const { data: avatar } = useAvatar()
  const uploadAvatar = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }
    try {
      await uploadAvatar.mutateAsync(file)
      toast.success('Profile picture updated')
    } catch {
      toast.error('Failed to upload profile picture')
    }
  }

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    try {
      await updateName.mutateAsync(name.trim())
      toast.success('Name updated successfully')
    } catch {
      toast.error('Failed to update name')
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Both current and new password are required')
      return
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await updatePassword.mutateAsync({ currentPassword, newPassword })
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to change password')
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload a profile photo</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="size-20">
                {avatar?.url ? (
                  <AvatarImage src={avatar.url} alt="Profile" />
                ) : null}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90 transition-colors"
              >
                <Camera className="size-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="text-sm text-[#6a7a65]">
              <p>JPG or PNG. Max 2MB.</p>
              {uploadAvatar.isPending && <p className="mt-1 text-primary">Uploading...</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-8">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your name and email</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ''} disabled className="text-[#6a7a65]" />
            <p className="text-xs text-[#6a7a65]">Email cannot be changed here. Contact support for email changes.</p>
          </div>
          <Button onClick={handleSaveName} disabled={updateName.isPending}>
            {updateName.isPending ? 'Saving...' : 'Save'}
          </Button>
        </CardContent>
      </Card>

      <Card className="p-8">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
          </div>
          <Button onClick={handleChangePassword} disabled={updatePassword.isPending}>
            {updatePassword.isPending ? 'Changing...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationsSection() {
  const { data: prefs, isLoading } = useNotificationPreferences()
  const updatePrefs = useUpdateNotificationPreferences()

  const toggle = async (key: keyof NonNullable<typeof prefs>) => {
    if (!prefs) return
    try {
      await updatePrefs.mutateAsync({ [key]: !prefs[key] })
      toast.success('Preference updated')
    } catch {
      toast.error('Failed to update preference')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-[#6a7a65]">Loading preferences...</CardContent>
      </Card>
    )
  }

  const items = [
    { key: 'checkinReminder' as const, label: 'Monthly Check-In Reminder', description: 'Get reminded on the 1st of each month to complete your check-in' },
    { key: 'milestoneEmails' as const, label: 'Milestone Emails', description: 'Receive emails when you unlock a new badge or achievement' },
    { key: 'weeklyDigest' as const, label: 'Weekly Digest', description: 'A weekly summary of your progress and tips' },
    { key: 'marketingEmails' as const, label: 'Marketing Emails', description: 'Product updates, tips, and offers (rare)' },
  ]

  return (
    <Card className="p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose which emails you'd like to receive</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-4">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4 rounded-lg border border-[#e8e6dd] p-4">
            <div>
              <p className="text-sm font-medium text-[#2d3a2a]">{item.label}</p>
              <p className="text-xs text-[#6a7a65]">{item.description}</p>
            </div>
            <button
              role="switch"
              aria-checked={prefs?.[item.key] ?? false}
              onClick={() => toggle(item.key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a7c59] focus-visible:ring-offset-2 ${prefs?.[item.key] ? 'bg-[#4a7c59]' : 'bg-[#e8e6dd]'}`}
            >
              <span className={`inline-block size-5 transform rounded-full bg-white transition-transform ${prefs?.[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ExportSection() {
  const dataExport = useDataExport()

  const handleExport = async () => {
    try {
      await dataExport.mutateAsync()
      toast.success('Data exported successfully')
    } catch {
      toast.error('Failed to export data')
    }
  }

  return (
    <Card className="p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Export Your Data</CardTitle>
        <CardDescription>
          Download all your ScoreLift data as a JSON file. Includes your profile, roadmap, check-in history, goals, and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Button onClick={handleExport} disabled={dataExport.isPending}>
          <Download className="mr-2 size-4" />
          {dataExport.isPending ? 'Exporting...' : 'Export My Data'}
        </Button>
      </CardContent>
    </Card>
  )
}

function DemoModeSection() {
  const { demoMode, toggleDemoMode } = useDemoMode()

  return (
    <Card className="p-8 border-[#4a7c59]/30">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-[#4a7c59]">
          <TestTube className="size-5" />
          Demo Mode
        </CardTitle>
        <CardDescription>
          Fill the dashboard with sample data to explore ScoreLift features without affecting your real credit profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-[#e8e6dd] p-4">
          <div>
            <p className="text-sm font-medium text-[#2d3a2a]">Enable Demo Mode</p>
            <p className="text-xs text-[#6a7a65]">
              {demoMode
                ? 'Demo data is active. Turn off to restore your real data.'
                : 'Seeds pages with sample data. Your real data is preserved.'}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={demoMode}
            onClick={() => {
              toggleDemoMode(!demoMode)
              toast.success(demoMode ? 'Demo mode disabled. Refreshing...' : 'Demo mode enabled. Refreshing...')
              setTimeout(() => window.location.reload(), 800)
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a7c59] focus-visible:ring-offset-2 ${demoMode ? 'bg-[#4a7c59]' : 'bg-[#e8e6dd]'}`}
          >
            <span className={`inline-block size-5 transform rounded-full bg-white transition-transform ${demoMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {demoMode && (
          <div className="rounded-lg bg-[#eaf0e8] p-4 text-sm text-[#2d3a2a]">
            <p className="font-medium text-[#4a7c59]">✅ Demo mode is active</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#6a7a65]">
              <li>Sample credit profile with score of 642</li>
              <li>Simulated check-in history over 6 months</li>
              <li>Pre-populated roadmap actions</li>
              <li>Active goal and sample milestones</li>
              <li>Your real data is safe and unchanged</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DangerSection({ userId, banned: bannedProp }: { userId?: string; banned?: boolean }) {
  const accountDeletion = useAccountDeletion()
  const accountRestore = useAccountRestore()
  const [confirmText, setConfirmText] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      const result = await accountDeletion.mutateAsync()
      toast.success(result.message)
      setDeleteDialogOpen(false)
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to initiate deletion')
    }
  }

  const handleRestore = async () => {
    try {
      const result = await accountRestore.mutateAsync()
      toast.success(result.message)
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to restore account')
    }
  }

  if (bannedProp) {
    return (
      <Card className="p-8 border-[#c0392b]/30">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2 text-[#c0392b]">
            <AlertTriangle className="size-5" />
            Account Deletion in Progress
          </CardTitle>
          <CardDescription>
            Your account is scheduled for permanent deletion. You can restore it within 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Button onClick={handleRestore} disabled={accountRestore.isPending} variant="outline" className="border-[#4a7c59] text-[#4a7c59]">
            <Undo2 className="mr-2 size-4" />
            {accountRestore.isPending ? 'Restoring...' : 'Restore My Account'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="p-8 border-[#c0392b]/30">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-[#c0392b]">
          <Trash2 className="size-5" />
          Close Account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action cannot be undone after 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-4">
        <div className="rounded-lg border border-[#c0392b]/20 bg-[#fae8e8] p-4 text-sm text-[#2d3a2a]">
          <p className="font-medium">What happens when you close your account:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[#6a7a65]">
            <li>Your Stripe subscription will be cancelled immediately</li>
            <li>Your data will be scheduled for permanent deletion in 30 days</li>
            <li>You can restore your account within the 30-day grace period</li>
            <li>After 30 days, all data is permanently erased</li>
          </ul>
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger>
            <Button variant="outline" className="border-[#c0392b] text-[#c0392b] hover:bg-[#fae8e8]">
              <Trash2 className="mr-2 size-4" />
              Close My Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This will cancel your subscription and start the 30-day deletion process.
                Type <strong>DELETE</strong> to confirm.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder='Type "DELETE" to confirm'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <DialogFooter>
              <Button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || accountDeletion.isPending}
                className="bg-[#c0392b] hover:bg-[#a93226]"
              >
                {accountDeletion.isPending ? 'Processing...' : 'Confirm Deletion'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

'use client'

import * as React from 'react'
import {
  Accessibility, AlarmClock, Anchor, AppWindow, Award, Axe, Badge, BaggageClaim, Banana, BarChart, Beaker, Bell, Bike, Binary, Book, Bookmark, Bot, Box, Briefcase, Brush, Bug, Building, Bus, Calendar, Camera, Car, Cat, Check, ChevronDown, Circle, Cloud, Code, Cog, Command, Compass, Contact, Cookie, Copy, CreditCard, Crown, Database, Delete, Diamond, Dog, DollarSign, Download, Droplet, Edit, Eye, File, Film, Filter, Flag, Flame, Folder, Frame, Gamepad2, Gem, Gift, GitBranch, Github, Globe, Grid, Hammer, Hand, HardDrive, Hash, Heading, Heart, HelpCircle, Home, Image, Inbox, Info, Key, Keyboard, Lamp, Laptop, Layers, Layout, Leaf, LifeBuoy, Lightbulb, Link, List, Lock, LogIn, LogOut, Mail, MapPin, Menu, MessageCircle, Mic, Monitor, Moon, MoreHorizontal, MousePointer, Move, Music, Package, Palette, Paperclip, Pause, Pen, Phone, PieChart, Pin, Play, Plus, Printer, Puzzle, Quote, RectangleHorizontal, RefreshCw, Rocket, Save, Scale, Scissors, ScreenShare, Search, Send, Settings, Share2, Shield, ShoppingBag, ShoppingCart, Signal, Smile, Sparkles, Speaker, Star, Sun, Table, Tag, Target, Terminal, ThumbsDown, ThumbsUp, ToggleLeft, ToggleRight, Trash2, TrendingUp, Truck, Tv, Type, Umbrella, Underline, Unlock, Upload, User, UserPlus, Users, Video, Voicemail, Volume2, Wallet, Watch, Wifi, Wind, Wrench, X, Youtube, Zap, ZoomIn, ZoomOut,
  type LucideIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command as CommandComponent,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export const iconList: { name: string; icon: LucideIcon }[] = [
    { name: 'Accessibility', icon: Accessibility }, { name: 'AlarmClock', icon: AlarmClock }, { name: 'Anchor', icon: Anchor },
    { name: 'AppWindow', icon: AppWindow }, { name: 'Award', icon: Award }, { name: 'Axe', icon: Axe }, { name: 'Badge', icon: Badge },
    { name: 'BaggageClaim', icon: BaggageClaim }, { name: 'Banana', icon: Banana }, { name: 'BarChart', icon: BarChart },
    { name: 'Beaker', icon: Beaker }, { name: 'Bell', icon: Bell }, { name: 'Bike', icon: Bike }, { name: 'Binary', icon: Binary },
    { name: 'Book', icon: Book }, { name: 'Bookmark', icon: Bookmark }, { name: 'Bot', icon: Bot }, { name: 'Box', icon: Box },
    { name: 'Briefcase', icon: Briefcase }, { name: 'Brush', icon: Brush }, { name: 'Bug', icon: Bug }, { name: 'Building', icon: Building },
    { name: 'Bus', icon: Bus }, { name: 'Calendar', icon: Calendar }, { name: 'Camera', icon: Camera }, { name: 'Car', icon: Car },
    { name: 'Cat', icon: Cat }, { name: 'Check', icon: Check }, { name: 'ChevronDown', icon: ChevronDown }, { name: 'Circle', icon: Circle },
    { name: 'Cloud', icon: Cloud }, { name: 'Code', icon: Code }, { name: 'Cog', icon: Cog }, { name: 'Command', icon: Command }, { name: 'Compass', icon: Compass }, { name: 'Contact', icon: Contact }, { name: 'Cookie', icon: Cookie }, { name: 'Copy', icon: Copy },
    { name: 'CreditCard', icon: CreditCard }, { name: 'Crown', icon: Crown }, { name: 'Database', icon: Database },
    { name: 'Delete', icon: Delete }, { name: 'Diamond', icon: Diamond }, { name: 'Dog', icon: Dog }, { name: 'DollarSign', icon: DollarSign },
    { name: 'Download', icon: Download }, { name: 'Droplet', icon: Droplet }, { name: 'Edit', icon: Edit }, { name: 'Eye', icon: Eye },
    { name: 'File', icon: File }, { name: 'Film', icon: Film }, { name: 'Filter', icon: Filter }, { name: 'Flag', icon: Flag },
    { name: 'Flame', icon: Flame }, { name: 'Folder', icon: Folder }, { name: 'Frame', icon: Frame }, { name: 'Gamepad2', icon: Gamepad2 },
    { name: 'Gem', icon: Gem }, { name: 'Gift', icon: Gift }, { name: 'GitBranch', icon: GitBranch }, { name: 'Github', icon: Github },
    { name: 'Globe', icon: Globe }, { name: 'Grid', icon: Grid }, { name: 'Hammer', icon: Hammer }, { name: 'Hand', icon: Hand },
    { name: 'HardDrive', icon: HardDrive }, { name: 'Hash', icon: Hash }, { name: 'Heading', icon: Heading }, { name: 'Heart', icon: Heart },
    { name: 'HelpCircle', icon: HelpCircle }, { name: 'Home', icon: Home }, { name: 'Image', icon: Image }, { name: 'Inbox', icon: Inbox },
    { name: 'Info', icon: Info }, { name: 'Key', icon: Key }, { name: 'Keyboard', icon: Keyboard }, { name: 'Lamp', icon: Lamp },
    { name: 'Laptop', icon: Laptop }, { name: 'Layers', icon: Layers }, { name: 'Layout', icon: Layout }, { name: 'Leaf', icon: Leaf },
    { name: 'LifeBuoy', icon: LifeBuoy }, { name: 'Lightbulb', icon: Lightbulb }, { name: 'Link', icon: Link }, { name: 'List', icon: List },
    { name: 'Lock', icon: Lock }, { name: 'LogIn', icon: LogIn }, { name: 'LogOut', icon: LogOut }, { name: 'Mail', icon: Mail },
    { name: 'MapPin', icon: MapPin }, { name: 'Menu', icon: Menu }, { name: 'MessageCircle', icon: MessageCircle }, { name: 'Mic', icon: Mic },
    { name: 'Monitor', icon: Monitor }, { name: 'Moon', icon: Moon }, { name: 'MoreHorizontal', icon: MoreHorizontal },
    { name: 'MousePointer', icon: MousePointer }, { name: 'Move', icon: Move }, { name: 'Music', icon: Music }, { name: 'Package', icon: Package },
    { name: 'Palette', icon: Palette }, { name: 'Paperclip', icon: Paperclip }, { name: 'Pause', icon: Pause }, { name: 'Pen', icon: Pen },
    { name: 'Phone', icon: Phone }, { name: 'PieChart', icon: PieChart }, { name: 'Pin', icon: Pin }, { name: 'Play', icon: Play },
    { name: 'Plus', icon: Plus }, { name: 'Printer', icon: Printer }, { name: 'Puzzle', icon: Puzzle }, { name: 'Quote', icon: Quote },
    { name: 'RectangleHorizontal', icon: RectangleHorizontal }, { name: 'RefreshCw', icon: RefreshCw }, { name: 'Rocket', icon: Rocket },
    { name: 'Save', icon: Save }, { name: 'Scale', icon: Scale }, { name: 'Scissors', icon: Scissors }, { name: 'ScreenShare', icon: ScreenShare },
    { name: 'Search', icon: Search }, { name: 'Send', icon: Send }, { name: 'Settings', icon: Settings }, { name: 'Share2', icon: Share2 },
    { name: 'Shield', icon: Shield }, { name: 'ShoppingBag', icon: ShoppingBag }, { name: 'ShoppingCart', icon: ShoppingCart },
    { name: 'Signal', icon: Signal }, { name: 'Smile', icon: Smile }, { name: 'Sparkles', icon: Sparkles }, { name: 'Speaker', icon: Speaker },
    { name: 'Star', icon: Star }, { name: 'Sun', icon: Sun }, { name: 'Table', icon: Table }, { name: 'Tag', icon: Tag },
    { name: 'Target', icon: Target }, { name: 'Terminal', icon: Terminal }, { name: 'ThumbsDown', icon: ThumbsDown },
    { name: 'ThumbsUp', icon: ThumbsUp }, { name: 'ToggleLeft', icon: ToggleLeft }, { name: 'ToggleRight', icon: ToggleRight },
    { name: 'Trash2', icon: Trash2 }, { name: 'TrendingUp', icon: TrendingUp }, { name: 'Truck', icon: Truck },
    { name: 'Tv', icon: Tv }, { name: 'Type', icon: Type }, { name: 'Umbrella', icon: Umbrella }, { name: 'Underline', icon: Underline },
    { name: 'Unlock', icon: Unlock }, { name: 'Upload', icon: Upload }, { name: 'User', icon: User }, { name: 'UserPlus', icon: UserPlus },
    { name: 'Users', icon: Users }, { name: 'Video', icon: Video }, { name: 'Voicemail', icon: Volume2 }, { name: 'Wallet', icon: Wallet },
    { name: 'Watch', icon: Watch }, { name: 'Wifi', icon: Wifi }, { name: 'Wind', icon: Wind }, { name: 'Wrench', icon: Wrench },
    { name: 'X', icon: X }, { name: 'Youtube', icon: Youtube }, { name: 'Zap', icon: Zap }, { name: 'ZoomIn', icon: ZoomIn },
    { name: 'ZoomOut', icon: ZoomOut }
];

interface IconSelectorProps {
  name?: string
  defaultValue?: string
}

export function IconSelector({ name, defaultValue }: IconSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue || '')

  const SelectedIcon = React.useMemo(() => {
    const found = iconList.find((item) => item.name.toLowerCase() === value.toLowerCase())
    return found ? found.icon : Sparkles
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
            <SelectedIcon className="mr-2 h-4 w-4" />
            {value ? value : 'Select an Icon'}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <CommandComponent>
          <CommandInput placeholder="Search icons..." />
          <CommandList>
            <CommandEmpty>No icon found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-6 gap-1 p-2">
                {iconList.map(({ name: iconName, icon: IconComponent }) => (
                  <CommandItem
                    key={iconName}
                    value={iconName}
                    onSelect={(currentValue) => {
                      setValue(currentValue.toLowerCase() === value.toLowerCase() ? '' : currentValue)
                      setOpen(false)
                    }}
                    className="flex items-center justify-center p-2 h-12 w-12 rounded-md cursor-pointer"
                  >
                    <IconComponent className="h-5 w-5" />
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </CommandList>
        </CommandComponent>
      </PopoverContent>
      <input type="hidden" name={name} value={value} />
    </Popover>
  )
}

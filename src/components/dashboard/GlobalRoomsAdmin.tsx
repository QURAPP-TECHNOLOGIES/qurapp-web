import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Radio, Play, Moon, Pause, Volume2, Globe, Users, RefreshCw,
  Search, ShieldAlert, Sparkles, Filter, CheckCircle2, AlertCircle, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiGatewayUrl, fetchWithAuth } from '@/lib/api';

interface RoomStats {
  totalRooms: number;
  coldStartRooms: number;
  userHostedRooms: number;
  activeStreams: number;
  playingStreams: number;
  sleepingStreams: number;
  streamStartsTotal: number;
  versesStreamedTotal: number;
}

interface LiveRoomItem {
  id: string;
  title: string;
  subtitle: string;
  roomType: string;
  status: string;
  participantCount: number;
  audioConfig?: {
    isGuidedReciter?: boolean;
    countryCode?: string;
    countryName?: string;
    slot?: number;
    series?: string;
  };
  liveSessionConfig?: {
    originType?: string;
    reciterName?: string;
    readingFrom?: string;
    readingTo?: string;
    occasionRule?: string;
  };
  lastActivityAt: string;
}

export function GlobalRoomsAdmin() {
  const { toast } = useToast();
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [rooms, setRooms] = useState<LiveRoomItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [originFilter, setOriginFilter] = useState<string>('COLD_START');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [seedCountryInput, setSeedCountryInput] = useState<string>('');

  const loadOverview = async () => {
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/admin/rooms/overview`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (e: any) {
      console.warn('Could not load room overview stats:', e.message);
    }
  };

  const loadRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (originFilter !== 'ALL') params.append('originType', originFilter);
      if (countryFilter !== 'ALL') params.append('countryCode', countryFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      params.append('limit', '30');

      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/admin/rooms?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.items || []);
        setTotalCount(data.total || 0);
      }
    } catch (e: any) {
      toast({
        title: 'Error loading rooms',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    loadRooms();
  }, [originFilter, countryFilter, statusFilter, searchQuery]);

  const handleStreamAction = async (roomId: string, action: 'wake' | 'sleep' | 'pause' | 'resume') => {
    setActionLoading(`${roomId}-${action}`);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/admin/rooms/${roomId}/${action}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: `Action Successful`,
          description: `Room stream action '${action}' triggered.`,
        });
        await loadOverview();
        await loadRooms();
      } else {
        throw new Error(data.error || 'Failed action');
      }
    } catch (e: any) {
      toast({
        title: `Action Failed`,
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleProvisionCountry = async () => {
    if (!seedCountryInput || seedCountryInput.trim().length !== 2) {
      toast({
        title: 'Invalid ISO Code',
        description: 'Please enter a valid 2-letter country code (e.g. SA, NG, GB).',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/admin/rooms/seed-country`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: seedCountryInput.trim().toUpperCase() })
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Provisioning Dispatched',
          description: data.message,
        });
        setSeedCountryInput('');
        loadOverview();
      }
    } catch (e: any) {
      toast({
        title: 'Provisioning failed',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cold-Start Rooms</CardTitle>
            <Radio className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.coldStartRooms ?? 550}</div>
            <p className="text-xs text-muted-foreground mt-1">Seeded Platform Bot Rooms</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">User-Hosted Rooms</CardTitle>
            <Users className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.userHostedRooms ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Community Created Rooms</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active WebRTC Streams</CardTitle>
            <Volume2 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeStreams ?? 0}</div>
            <p className="text-xs text-emerald-500 font-medium mt-1">
              {stats?.playingStreams ?? 0} streaming audio live
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Idle Sleeping Rooms</CardTitle>
            <Moon className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sleepingStreams ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">0% CPU / Sub-second instant wake</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Control Bar */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Origin Segmentation Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Origin:</span>
              <Button
                variant={originFilter === 'COLD_START' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOriginFilter('COLD_START')}
                className="gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Cold-Start Bots
              </Button>
              <Button
                variant={originFilter === 'USER' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOriginFilter('USER')}
                className="gap-1.5"
              >
                <Users className="h-3.5 w-3.5" />
                Community Rooms
              </Button>
              <Button
                variant={originFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOriginFilter('ALL')}
              >
                All Rooms
              </Button>
            </div>

            {/* Quick Provisioning */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Country Code (e.g. SA, NG)"
                value={seedCountryInput}
                onChange={(e) => setSeedCountryInput(e.target.value.toUpperCase())}
                maxLength={2}
                className="w-40 h-8 text-xs font-mono uppercase"
              />
              <Button size="sm" variant="secondary" onClick={handleProvisionCountry} className="gap-1.5 h-8">
                <Plus className="h-3.5 w-3.5" />
                Seed Country
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search room title or reciter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Filter by Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Countries</SelectItem>
                <SelectItem value="SA">🇸🇦 Saudi Arabia (SA)</SelectItem>
                <SelectItem value="EG">🇪🇬 Egypt (EG)</SelectItem>
                <SelectItem value="NG">🇳🇬 Nigeria (NG)</SelectItem>
                <SelectItem value="ID">🇮🇩 Indonesia (ID)</SelectItem>
                <SelectItem value="PK">🇵🇰 Pakistan (PK)</SelectItem>
                <SelectItem value="TR">🇹🇷 Turkey (TR)</SelectItem>
                <SelectItem value="AE">🇦🇪 United Arab Emirates (AE)</SelectItem>
                <SelectItem value="GB">🇬🇧 United Kingdom (GB)</SelectItem>
                <SelectItem value="US">🇺🇸 United States (US)</SelectItem>
                <SelectItem value="CA">🇨🇦 Canada (CA)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table / Grid */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Live Room Catalog</CardTitle>
            <CardDescription className="text-xs">
              Showing {rooms.length} of {totalCount} matching rooms
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { loadOverview(); loadRooms(); }} className="gap-1.5 h-8">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              Loading real-time room telemetries...
            </div>
          ) : rooms.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No rooms found matching the selected filters.
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {rooms.map((room) => {
                const isColdStart = room.liveSessionConfig?.originType === 'COLD_START' || room.audioConfig?.isGuidedReciter;
                const reciter = room.liveSessionConfig?.reciterName || 'Sheikh Mishary Alafasy';
                const country = room.audioConfig?.countryName || room.audioConfig?.countryCode || 'Global';

                return (
                  <div key={room.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{room.title}</span>
                        {isColdStart ? (
                          <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            🤖 Cold-Start Bot
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
                            👤 Community Host
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          {room.roomType}
                        </Badge>
                        <Badge
                          variant={room.status === 'active' ? 'default' : 'outline'}
                          className={`text-[10px] capitalize ${room.status === 'active' ? 'bg-emerald-600 text-white' : ''}`}
                        >
                          {room.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-1">{room.subtitle}</p>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>🎙️ {reciter}</span>
                        <span>•</span>
                        <span>🌍 {country}</span>
                        <span>•</span>
                        <span>📖 Pages {room.liveSessionConfig?.readingFrom || 1}–{room.liveSessionConfig?.readingTo || 604}</span>
                      </div>
                    </div>

                    {/* Operational Controls */}
                    <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        disabled={actionLoading === `${room.id}-wake`}
                        onClick={() => handleStreamAction(room.id, 'wake')}
                      >
                        <Play className="h-3 w-3 text-emerald-500" />
                        Wake
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        disabled={actionLoading === `${room.id}-sleep`}
                        onClick={() => handleStreamAction(room.id, 'sleep')}
                      >
                        <Moon className="h-3 w-3 text-indigo-400" />
                        Sleep
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs gap-1"
                        disabled={actionLoading === `${room.id}-pause`}
                        onClick={() => handleStreamAction(room.id, 'pause')}
                      >
                        <Pause className="h-3 w-3 text-amber-500" />
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs gap-1"
                        disabled={actionLoading === `${room.id}-resume`}
                        onClick={() => handleStreamAction(room.id, 'resume')}
                      >
                        <Volume2 className="h-3 w-3 text-sky-500" />
                        Resume
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export default GlobalRoomsAdmin;

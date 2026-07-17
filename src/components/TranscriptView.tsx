// Diarized transcript as a clinical chat — Doctor left (white card), Patient
// right (teal-tinted). Speaker chip on the first bubble of each run. When a
// line is backed by a recorded audio chunk, tapping the bubble plays the clip.

import { Play, Square } from 'lucide-react-native';
import { useEffect, useState } from 'react';

import { T } from './ui';
import { onPlaybackChange, playClip } from '@/lib/audio';
import { chunkForLine } from '@/lib/evidence';
import { Pressable, View } from '@/tw';
import type { AudioChunk, Speaker, TranscriptLine } from '@/types/clinical';

const SPEAKER_META: Record<Speaker, { name: string; bubbleClass: string }> = {
  Doctor: { name: 'Doctor', bubbleClass: 'bg-card' },
  Patient: { name: 'Patient', bubbleClass: 'bg-accent-soft' },
  Unknown: { name: 'Speaker', bubbleClass: 'bg-card' },
};

function fmtTime(sec?: number) {
  if (sec === undefined) return null;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ChatBubble({
  line,
  showName,
  clipUri,
  playing,
}: {
  line: TranscriptLine;
  showName: boolean;
  /** Audio chunk URI backing this line, when available. */
  clipUri?: string;
  playing?: boolean;
}) {
  const meta = SPEAKER_META[line.speaker];
  const isPatient = line.speaker === 'Patient';
  const time = fmtTime(line.startTime);

  const bubble = (
    <View
      className={`py-3 px-4 rounded-card shadow-card ${meta.bubbleClass} ${
        isPatient ? 'rounded-br-md' : 'rounded-bl-md'
      }`}>
      <View className="flex-row items-center gap-2">
        {clipUri && (
          <View className="w-[22px] h-[22px] rounded-full bg-card items-center justify-center">
            {playing ? (
              <Square size={12} color="#0F6E6B" fill="#0F6E6B" strokeWidth={2} />
            ) : (
              <Play size={12} color="#0F6E6B" fill="#0F6E6B" strokeWidth={2} />
            )}
          </View>
        )}
        <T variant="secondary" className="shrink">
          {line.text}
        </T>
      </View>
    </View>
  );

  return (
    <View className="gap-1" style={{ alignItems: isPatient ? 'flex-end' : 'flex-start' }}>
      {showName && (
        <View className="flex-row items-baseline gap-2 px-1 mt-2">
          <T variant="caption" tone="accent" className="font-semibold">
            {meta.name}
          </T>
          {time && (
            <T variant="caption" tone="faint">
              {time}
            </T>
          )}
        </View>
      )}
      {clipUri ? (
        <Pressable
          onPress={() => playClip(clipUri)}
          accessibilityRole="button"
          className="max-w-[84%]"
          style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}>
          {bubble}
        </Pressable>
      ) : (
        <View className="max-w-[84%]">{bubble}</View>
      )}
    </View>
  );
}

export function TranscriptView({ lines, chunks = [] }: { lines: TranscriptLine[]; chunks?: AudioChunk[] }) {
  const [playingUri, setPlayingUri] = useState<string | null>(null);
  useEffect(() => onPlaybackChange(setPlayingUri), []);

  return (
    <View className="gap-2">
      {lines.map((line, i) => {
        const clip = chunkForLine(line, chunks);
        return (
          <ChatBubble
            key={line.id}
            line={line}
            showName={lines[i - 1]?.speaker !== line.speaker}
            clipUri={clip?.uri}
            playing={!!clip && playingUri === clip.uri}
          />
        );
      })}
    </View>
  );
}

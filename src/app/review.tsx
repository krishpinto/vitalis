// Review — the transcript (chat styling continues), photo/records attachments,
// entity chips after structuring, then the differential draft CTA.

import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowRight, Camera, FileText, Sparkles, X } from 'lucide-react-native';
import { useState } from 'react';
import { Image } from 'react-native';

import { EntityCard } from '@/components/EntityCard';
import { TranscriptView } from '@/components/TranscriptView';
import { Chip, EmptyState, ErrorCard, PrimaryButton, Rise, SectionHeader, SkeletonCard, T } from '@/components/ui';
import { reasonDifferentials, structureTranscript } from '@/lib/gemini';
import { useConsult } from '@/lib/store';
import { Pressable, ScrollView, View } from '@/tw';
import type { Attachment } from '@/types/clinical';

export default function ReviewScreen() {
  const router = useRouter();
  const { transcript, chunks, entities, setEntities, setDiagnosis, attachments, addAttachment, removeAttachment, refining } =
    useConsult();

  const [structuring, setStructuring] = useState(false);
  const [reasoning, setReasoning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!transcript) {
    return (
      <View className="flex-1 bg-bg justify-center">
        <EmptyState
          icon={FileText}
          text="No transcript yet — record a consult first."
          actionLabel="Back to patients"
          onAction={() => router.replace('/patients')}
        />
      </View>
    );
  }

  async function attachPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.7,
      base64: true,
    });
    const asset = result.assets?.[0];
    if (result.canceled || !asset?.base64) return;
    addAttachment({
      id: `att_${Date.now()}`,
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      base64: asset.base64,
    } satisfies Attachment);
  }

  async function analyze() {
    setError(null);
    setStructuring(true);
    try {
      setEntities(await structureTranscript(transcript!));
    } catch (err) {
      setError(`Structuring failed: ${err}`);
    } finally {
      setStructuring(false);
    }
  }

  async function generateDifferential() {
    if (!entities) return;
    setError(null);
    setReasoning(true);
    try {
      setDiagnosis(await reasonDifferentials(entities, transcript, attachments));
      router.push('/diagnosis');
    } catch (err) {
      setError(`Reasoning failed: ${err}`);
    } finally {
      setReasoning(false);
    }
  }

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="p-4 gap-3 pb-6">
        <SectionHeader
          title="Transcript"
          trailing={
            refining ? (
              <Chip label="refining speakers…" />
            ) : transcript.isDemo ? (
              <Chip label="synthetic" tint="#B7791F" soft="#FDF6E9" />
            ) : undefined
          }
        />
        <TranscriptView lines={transcript.lines} chunks={chunks} />

        <SectionHeader
          title="Photos & records"
          trailing={
            <Pressable onPress={attachPhoto} hitSlop={8} accessibilityRole="button" className="flex-row items-center gap-1">
              <Camera size={15} color="#0F6E6B" strokeWidth={2.2} />
              <T variant="caption" tone="accent" className="font-semibold">
                Attach
              </T>
            </Pressable>
          }
        />
        {attachments.length === 0 ? (
          <T variant="caption" tone="faint">
            Optional — attach a rash photo or prior report to inform the draft.
          </T>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            {attachments.map((a) => (
              <View key={a.id} className="relative">
                <Image source={{ uri: a.uri }} style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: '#ECEAE3' }} />
                <Pressable
                  onPress={() => removeAttachment(a.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ink items-center justify-center"
                  hitSlop={8}
                  accessibilityRole="button">
                  <X size={12} color="#FFFFFF" strokeWidth={2.5} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {(structuring || entities) && <SectionHeader title="Structured summary" />}
        {structuring ? (
          <SkeletonCard lines={5} />
        ) : (
          entities && (
            <Rise>
              <EntityCard entities={entities} />
            </Rise>
          )
        )}

        {error && <ErrorCard message={error} onRetry={entities ? generateDifferential : analyze} />}
      </ScrollView>

      <View className="p-4 bg-card border-t border-border">
        {!entities ? (
          <PrimaryButton label="Analyze" onPress={analyze} loading={structuring} icon={Sparkles} />
        ) : (
          <PrimaryButton
            label="Generate differential draft"
            onPress={generateDifferential}
            loading={reasoning}
            icon={ArrowRight}
          />
        )}
      </View>
    </View>
  );
}

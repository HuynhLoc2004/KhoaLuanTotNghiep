import type {
  RecognitionFeedbackRequest,
  RecognitionFeedbackResponse,
  RecognitionIdentifyResponse,
  RecognitionReference as RecognitionReferenceDto,
  RecognitionReferenceListResponse,
  RecognitionReferenceUpsertRequest,
} from "@hcmc-museum/contracts";
import { computeDescriptor, DESCRIPTOR_DIMENSIONS } from "./descriptor.js";
import { RecognitionReferenceStore } from "./referenceStore.js";
import { classifyStatus, rankReferences } from "./matcher.js";

export interface RecognitionFeedbackRecord extends RecognitionFeedbackRequest {
  receivedAt: string;
}

const TOP_K = 3;

export class RecognitionService {
  private readonly references: RecognitionReferenceStore;
  private readonly feedbackLog: RecognitionFeedbackRecord[] = [];

  constructor() {
    this.references = new RecognitionReferenceStore();
  }

  public identify(imageBase64: string, zoneHint: string | undefined): RecognitionIdentifyResponse {
    const bytes = Buffer.from(imageBase64, "base64");
    const descriptor = computeDescriptor(bytes);
    const ranked = rankReferences(descriptor, this.references.getAll(), zoneHint).slice(0, TOP_K);
    const status = classifyStatus(ranked[0]?.confidence);

    return {
      status,
      candidates: ranked,
      matchThreshold: 0.999,
      lowConfidenceThreshold: 0.9,
    };
  }

  public recordFeedback(input: RecognitionFeedbackRequest): RecognitionFeedbackResponse {
    this.feedbackLog.push({ ...input, receivedAt: new Date().toISOString() });
    return { received: true };
  }

  public listFeedback(): RecognitionFeedbackRecord[] {
    return [...this.feedbackLog];
  }

  public listReferences(): RecognitionReferenceListResponse {
    const items: RecognitionReferenceDto[] = this.references.getAll().map((reference) => ({
      artifactId: reference.artifactId,
      title: reference.title,
      zoneId: reference.zoneId,
      descriptorDimensions: DESCRIPTOR_DIMENSIONS,
      updatedAt: reference.updatedAt,
    }));
    return { items };
  }

  public upsertReference(input: RecognitionReferenceUpsertRequest): RecognitionReferenceDto {
    const reference = this.references.upsert({
      artifactId: input.artifactId,
      title: input.title,
      imageBytes: Buffer.from(input.imageBase64, "base64"),
      zoneId: input.zoneId,
    });
    return {
      artifactId: reference.artifactId,
      title: reference.title,
      zoneId: reference.zoneId,
      descriptorDimensions: DESCRIPTOR_DIMENSIONS,
      updatedAt: reference.updatedAt,
    };
  }
}

export const recognitionService = new RecognitionService();

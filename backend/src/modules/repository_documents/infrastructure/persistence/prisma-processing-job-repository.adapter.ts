import { PrismaClient } from '@prisma/client';
import { ProcessingJob, ProcessingStatus, ProcessingType } from '../../domain/entities/processing-job.entity';

export class PrismaProcessingJobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(record: any): ProcessingJob {
    return new ProcessingJob(
      record.id,
      record.documentId,
      record.jobType as ProcessingType,
      record.status as ProcessingStatus,
      record.progress,
      record.errorMessage,
      record.jobDetails,
      record.result,
      record.startedAt,
      record.completedAt,
      record.createdAt,
    );
  }

  private toPersistence(job: ProcessingJob) {
    return {
      id: job.id,
      documentId: job.documentId,
      jobType: job.jobType as any,
      status: job.status as any,
      progress: job.progress,
      errorMessage: job.errorMessage,
      jobDetails: job.jobDetails,
      result: job.result,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      createdAt: job.createdAt,
    };
  }

 
  async create(job: ProcessingJob): Promise<ProcessingJob> {
    const existing = await this.prisma.processingJob.findFirst({
      where: {
        documentId: job.documentId,
        jobType: job.jobType,
        status: {
          in: ['PENDING', 'RUNNING', 'RETRYING'],
        },
      },
    });

    if (existing) {
      return this.toDomain(existing); // ya existe un job activo
    }

    const created = await this.prisma.processingJob.create({
      data: this.toPersistence(job),
    });

    return this.toDomain(created);
  }


  async save(job: ProcessingJob): Promise<ProcessingJob> {
    const updated = await this.prisma.processingJob.update({
      where: { id: job.id },
      data: this.toPersistence(job),
    });

    return this.toDomain(updated);
  }

 
  async findById(id: string): Promise<ProcessingJob | null> {
    const record = await this.prisma.processingJob.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

 
  async updateProgress(id: string, progress: number): Promise<void> {
    await this.prisma.processingJob.update({
      where: { id },
      data: { progress },
    });
  }


  async findByDocumentId(documentId: string): Promise<ProcessingJob[]> {
    const jobs = await this.prisma.processingJob.findMany({ where: { documentId } });
    return jobs.map(this.toDomain);
  }
}

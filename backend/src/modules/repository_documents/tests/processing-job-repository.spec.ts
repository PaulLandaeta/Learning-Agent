import { PrismaClient, DocumentStatus } from "@prisma/client";
import { PrismaProcessingJobRepository } from "../infrastructure/persistence/prisma-processing-job-repository.adapter";
import {
  ProcessingJob,
  ProcessingStatus,
  ProcessingType,
} from "../domain/entities/processing-job.entity";

const prisma = new PrismaClient();
const repository = new PrismaProcessingJobRepository(prisma);

describe("ProcessingJobRepository - idempotencia", () => {
  beforeAll(async () => {
    await prisma.processingJob.deleteMany();
    await prisma.document.deleteMany();
    await prisma.user.deleteMany();

    // 👇 Crear usuario base
    await prisma.user.create({
      data: {
        id: "user-1",
        name: "Tester",
        lastname: "Prueba",
        email: "test@example.com",
        password: "123456",
      },
    });
  });

  it("no debe crear duplicados si el mismo documento se procesa dos veces", async () => {

    const document = await prisma.document.create({
      data: {
        id: "doc-1",
        originalName: "prueba.pdf",
        storedName: "doc1.pdf",
        s3Key: "uploads/doc1.pdf",
        size: 1024,
        contentType: "application/pdf",
        fileHash: "hash123",
        uploadedBy: "user-1",
        status: DocumentStatus.UPLOADED, 
      },
    });

  
    const job = new ProcessingJob(
      "job-1",
      document.id,
      ProcessingType.FULL_PROCESSING, 
      ProcessingStatus.PENDING, 
      0,
      "",
      "",
      "",
      new Date(),
      null,
      new Date()
    );

    const first = await repository.create(job);
    const second = await repository.create(job); 

    expect(second.id).toBe(first.id);

    const all = await prisma.processingJob.findMany();
    expect(all.length).toBe(1);
  });

  afterAll(async () => {
    await prisma.processingJob.deleteMany();
    await prisma.document.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });
});

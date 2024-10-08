import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const kabupatenName = searchParams.get('kabupatenName') || '';
  const kecamatanName = searchParams.get('kecamatanName') || '';
  const kelurahanName = searchParams.get('kelurahanName') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  try {
    const skip = (page - 1) * pageSize;

    const tpsData = await prisma.kabupaten.findMany({
      where: {
        nama: kabupatenName ? { contains: kabupatenName, mode: 'insensitive' } : undefined,
        kecamatan: {
          some: {
            nama: kecamatanName ? { contains: kecamatanName, mode: 'insensitive' } : undefined,
            kelurahan: {
              some: {
                nama: kelurahanName ? { contains: kelurahanName, mode: 'insensitive' } : undefined,
              },
            },
          },
        },
      },
      include: {
        kecamatan: {
          where: {
            nama: kecamatanName ? { contains: kecamatanName, mode: 'insensitive' } : undefined,
          },
          include: {
            kelurahan: {
              where: {
                nama: kelurahanName ? { contains: kelurahanName, mode: 'insensitive' } : undefined,
              },
              include: {
                tps: true,
              },
            },
          },
        },
      },
      skip: parseInt(skip, 10),
      take: parseInt(pageSize, 10),
    });

    const totalCount = await prisma.kabupaten.count({
      where: {
        nama: kabupatenName ? { contains: kabupatenName, mode: 'insensitive' } : undefined,
        kecamatan: {
          some: {
            nama: kecamatanName ? { contains: kecamatanName, mode: 'insensitive' } : undefined,
            kelurahan: {
              some: {
                nama: kelurahanName ? { contains: kelurahanName, mode: 'insensitive' } : undefined,
              },
            },
          },
        },
      },
    });

    return new Response(JSON.stringify({ data: tpsData, totalCount }), { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}

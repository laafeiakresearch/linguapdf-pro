import React from 'react';
import { DocumentReader } from '@/components/reader/DocumentReader';

interface PageProps {
  params: {
    docId: string;
  };
  searchParams: {
    page?: string;
  };
}

export default function ReaderPage({ params, searchParams }: PageProps) {
  const initialPage = searchParams.page ? parseInt(searchParams.page, 10) : undefined;

  return (
    <DocumentReader
      docId={params.docId}
      initialPage={initialPage}
    />
  );
}

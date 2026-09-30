export interface BookProfile {
  pageCount: number;

  text: {
    totalChars: number;
    avgCharsPerPage: number;
    medianCharsPerPage: number;
    lowTextPageRatio: number;
    highTextPageRatio: number;
  };

  images: {
    totalImageOperations: number;
    pagesWithImagesRatio: number;
    avgImagesPerPage: number;
  };

  layout: {
    landscapePageRatio: number;
    multiColumnPageRatio: number;
  };

  activities: {
    activitySignalPageRatio: number;
  };
}

export interface PageObservation {
  pageNumber: number;
  width: number;
  height: number;
  charCount: number;
  textItemCount: number;
  imageOperationCount: number;
  isLandscape: boolean;
  isLikelyMultiColumn: boolean;
  hasActivitySignals: boolean;
}

export interface PositionedTextItem {
  text: string;
  x: number;
}

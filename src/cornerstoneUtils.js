// @ts-check

import {
  cornerstoneStreamingImageVolumeLoader,
  init as csRenderInit,
  Enums,
  RenderingEngine,
  volumeLoader,
} from "@cornerstonejs/core";
import cornerstoneDICOMImageLoader, {
  init as dicomImageLoaderInit,
} from "@cornerstonejs/dicom-image-loader";
import { init as csToolsInit } from "@cornerstonejs/tools";
import { api } from "dicomweb-client";

volumeLoader.registerUnknownVolumeLoader(cornerstoneStreamingImageVolumeLoader);

/**
 *
 * @param {HTMLDivElement} elementRef
 * @param {Partial<import("@cornerstonejs/core").Types.Cornerstone3DConfig>} options
 */
export async function initializeCornerstone(elementRef, options = {}) {
  await csRenderInit(options);
  await csToolsInit();
  dicomImageLoaderInit({ maxWebWorkers: 1 });

  // Get Cornerstone imageIds and fetch metadata into RAM
  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID:
      "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
    SeriesInstanceUID:
      "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
    wadoRsRoot: "https://d14fa38qiwhyfd.cloudfront.net/dicomweb",
  });

  const renderingEngineId = "myRenderingEngine";
  const renderingEngine = new RenderingEngine(renderingEngineId);

  const viewportId = "CT_AXIAL_STACK";

  /** @type {import("@cornerstonejs/core").Types.PublicViewportInput} */
  const viewportInput = {
    viewportId,
    element: elementRef,
    type: Enums.ViewportType.STACK,
    defaultOptions: {
      background: [1, 0.75, 0.8],
    },
  };

  renderingEngine.enableElement(viewportInput);

  const viewport = renderingEngine.getViewport(viewportId);

  viewport.setStack(imageIds, 60);

  viewport.render();

  /**
   * The issue is that when CPU rending is used, `.setDisplayArea` throws an error.
   * When the default GPU rendering is used, no error is thrown.
   *
   * The error is:
   * ```
   * StackViewport.js:812 Uncaught TypeError: Cannot destructure property 'focalPoint' of 'cameraInterface' as it is undefined.
   *     at StackViewport.setCameraCPU (StackViewport.js:812:17)
   *     at StackViewport.setDisplayArea (Viewport.js:391:14)
   *     at initializeCornerstone (cornerstoneUtils.js:61:12)
   *     at async cs-cpu.js:5:18
   * ```
   */
  viewport.setDisplayArea({
    imageArea: [1.5, 1.5],
    // imageCanvasPoint: {
    //   imagePoint: [0, 0.5],
    //   canvasPoint: [0, 0.5],
    // },
    storeAsInitialCamera: true,
  });

  return viewport;
}

/**
/**
 * Uses dicomweb-client to fetch metadata of a study, cache it in cornerstone,
 * and return a list of imageIds for the frames.
 *
 * Uses the app config to choose which study to fetch, and which
 * dicom-web server to fetch it from.
 *
 * @returns {string[]} An array of imageIds for instances in the study.
 */

export default async function createImageIdsAndCacheMetaData({
  StudyInstanceUID,
  SeriesInstanceUID,
  SOPInstanceUID = null,
  wadoRsRoot,
  client = null,
}) {
  const SOP_INSTANCE_UID = "00080018";
  const SERIES_INSTANCE_UID = "0020000E";

  const studySearchOptions = {
    studyInstanceUID: StudyInstanceUID,
    seriesInstanceUID: SeriesInstanceUID,
  };

  client =
    client || new api.DICOMwebClient({ url: wadoRsRoot, singlepart: true });
  const instances = await client.retrieveSeriesMetadata(studySearchOptions);
  const imageIds = instances.map((instanceMetaData) => {
    const SeriesInstanceUID = instanceMetaData[SERIES_INSTANCE_UID].Value[0];
    const SOPInstanceUIDToUse =
      SOPInstanceUID || instanceMetaData[SOP_INSTANCE_UID].Value[0];

    const prefix = "wadors:";

    const imageId =
      prefix +
      wadoRsRoot +
      "/studies/" +
      StudyInstanceUID +
      "/series/" +
      SeriesInstanceUID +
      "/instances/" +
      SOPInstanceUIDToUse +
      "/frames/1";

    cornerstoneDICOMImageLoader.wadors.metaDataManager.add(
      imageId,
      instanceMetaData
    );
    return imageId;
  });

  // we don't want to add non-pet
  // Note: for 99% of scanners SUV calculation is consistent bw slices

  return imageIds;
}

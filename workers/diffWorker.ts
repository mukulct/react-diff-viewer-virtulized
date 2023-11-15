import { expose } from 'threads/worker';

import { computeHiddenBlocks } from '../src/compute-hidden-blocks';
import { computeLineInformation } from '../src/compute-lines';

expose({
  computeHiddenBlocks,
  computeLineInformation,
});

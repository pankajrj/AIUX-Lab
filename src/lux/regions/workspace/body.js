import {region} from '@servicenow/aiux/aiux-components-core';
import '../../widgets/aiux-kb-article-list/index.js';
import '../../widgets/aiux-kb-article-detail/index.js';

export default () => region`
  <row>
    <column span=${12} span-lg=${4}>
      <aiux-kb-article-list aiux-config-id="workspace-article-list" />
    </column>
    <column span=${12} span-lg=${8}>
      <aiux-kb-article-detail aiux-config-id="workspace-article-detail" />
    </column>
  </row>
`;

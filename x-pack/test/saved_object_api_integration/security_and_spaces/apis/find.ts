/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AUTHENTICATION } from '../../common/lib/authentication';
import { SPACES } from '../../common/lib/spaces';
import { TestInvoker } from '../../common/lib/types';
import { findTestSuiteFactory } from '../../common/suites/find';

// tslint:disable:no-default-export
export default function({ getService }: TestInvoker) {
  const supertest = getService('supertestWithoutAuth');
  const esArchiver = getService('esArchiver');

  describe('find', () => {
    const {
      createExpectEmpty,
      createExpectRbacForbidden,
      createExpectLegacyForbidden,
      createExpectVisualizationResults,
      expectNotSpaceAwareResults,
      expectTypeRequired,
      findTest,
    } = findTestSuiteFactory(esArchiver, supertest);

    [
      {
        spaceId: SPACES.DEFAULT.spaceId,
        users: {
          noAccess: AUTHENTICATION.NOT_A_KIBANA_USER,
          superuser: AUTHENTICATION.SUPERUSER,
          legacyAll: AUTHENTICATION.KIBANA_LEGACY_USER,
          legacyRead: AUTHENTICATION.KIBANA_LEGACY_DASHBOARD_ONLY_USER,
          allGlobally: AUTHENTICATION.KIBANA_RBAC_USER,
          readGlobally: AUTHENTICATION.KIBANA_RBAC_DASHBOARD_ONLY_USER,
          dualAll: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_USER,
          dualRead: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_DASHBOARD_ONLY_USER,
          allAtSpace: AUTHENTICATION.KIBANA_RBAC_DEFAULT_SPACE_ALL_USER,
          readAtSpace: AUTHENTICATION.KIBANA_RBAC_DEFAULT_SPACE_READ_USER,
          allAtOtherSpace: AUTHENTICATION.KIBANA_RBAC_SPACE_1_ALL_USER,
        },
      },
      {
        spaceId: SPACES.SPACE_1.spaceId,
        users: {
          noAccess: AUTHENTICATION.NOT_A_KIBANA_USER,
          superuser: AUTHENTICATION.SUPERUSER,
          legacyAll: AUTHENTICATION.KIBANA_LEGACY_USER,
          legacyRead: AUTHENTICATION.KIBANA_LEGACY_DASHBOARD_ONLY_USER,
          allGlobally: AUTHENTICATION.KIBANA_RBAC_USER,
          readGlobally: AUTHENTICATION.KIBANA_RBAC_DASHBOARD_ONLY_USER,
          dualAll: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_USER,
          dualRead: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_DASHBOARD_ONLY_USER,
          allAtSpace: AUTHENTICATION.KIBANA_RBAC_SPACE_1_ALL_USER,
          readAtSpace: AUTHENTICATION.KIBANA_RBAC_SPACE_1_READ_USER,
          allAtOtherSpace: AUTHENTICATION.KIBANA_RBAC_DEFAULT_SPACE_ALL_USER,
        },
      },
    ].forEach(scenario => {
      findTest(`${scenario.users.noAccess.USERNAME} within the ${scenario.spaceId} space`, {
        auth: {
          username: AUTHENTICATION.NOT_A_KIBANA_USER.USERNAME,
          password: AUTHENTICATION.NOT_A_KIBANA_USER.PASSWORD,
        },
        spaceId: scenario.spaceId,
        tests: {
          spaceAwareType: {
            description: 'forbidden login and find visualization message',
            statusCode: 403,
            response: createExpectLegacyForbidden(AUTHENTICATION.NOT_A_KIBANA_USER.USERNAME),
          },
          notSpaceAwareType: {
            description: 'forbidden login and find globaltype message',
            statusCode: 403,
            response: createExpectLegacyForbidden(AUTHENTICATION.NOT_A_KIBANA_USER.USERNAME),
          },
          unknownType: {
            description: 'forbidden login and find wigwags message',
            statusCode: 403,
            response: createExpectLegacyForbidden(AUTHENTICATION.NOT_A_KIBANA_USER.USERNAME),
          },
          pageBeyondTotal: {
            description: 'forbidden login and find visualization message',
            statusCode: 403,
            response: createExpectLegacyForbidden(AUTHENTICATION.NOT_A_KIBANA_USER.USERNAME),
          },
          unknownSearchField: {
            description: 'forbidden login and find wigwags message',
            statusCode: 403,
            response: createExpectLegacyForbidden(AUTHENTICATION.NOT_A_KIBANA_USER.USERNAME),
          },
          noType: {
            description: 'bad request, type is required',
            statusCode: 400,
            response: expectTypeRequired,
          },
        },
      });

      findTest(`${scenario.users.superuser.USERNAME} within the ${scenario.spaceId} space`, {
        auth: {
          username: AUTHENTICATION.SUPERUSER.USERNAME,
          password: AUTHENTICATION.SUPERUSER.PASSWORD,
        },
        spaceId: scenario.spaceId,
        tests: {
          spaceAwareType: {
            description: 'only the visualization',
            statusCode: 200,
            response: createExpectVisualizationResults(scenario.spaceId),
          },
          notSpaceAwareType: {
            description: 'only the globaltype',
            statusCode: 200,
            response: expectNotSpaceAwareResults,
          },
          unknownType: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(1, 20, 0),
          },
          pageBeyondTotal: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(100, 100, 1),
          },
          unknownSearchField: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(1, 20, 0),
          },
          noType: {
            description: 'bad request, type is required',
            statusCode: 400,
            response: expectTypeRequired,
          },
        },
      });

      findTest(`${scenario.users.legacyAll.USERNAME} within the ${scenario.spaceId} space`, {
        auth: {
          username: AUTHENTICATION.KIBANA_LEGACY_USER.USERNAME,
          password: AUTHENTICATION.KIBANA_LEGACY_USER.PASSWORD,
        },
        spaceId: scenario.spaceId,
        tests: {
          spaceAwareType: {
            description: 'only the visualization',
            statusCode: 200,
            response: createExpectVisualizationResults(scenario.spaceId),
          },
          notSpaceAwareType: {
            description: 'only the globaltype',
            statusCode: 200,
            response: expectNotSpaceAwareResults,
          },
          unknownType: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(1, 20, 0),
          },
          pageBeyondTotal: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(100, 100, 1),
          },
          unknownSearchField: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(1, 20, 0),
          },
          noType: {
            description: 'bad request, type is required',
            statusCode: 400,
            response: expectTypeRequired,
          },
        },
      });

      findTest(`${scenario.users.legacyRead.USERNAME} within the ${scenario.spaceId} space`, {
        auth: {
          username: AUTHENTICATION.KIBANA_LEGACY_DASHBOARD_ONLY_USER.USERNAME,
          password: AUTHENTICATION.KIBANA_LEGACY_DASHBOARD_ONLY_USER.PASSWORD,
        },
        spaceId: scenario.spaceId,
        tests: {
          spaceAwareType: {
            description: 'only the visualization',
            statusCode: 200,
            response: createExpectVisualizationResults(scenario.spaceId),
          },
          notSpaceAwareType: {
            description: 'only the globaltype',
            statusCode: 200,
            response: expectNotSpaceAwareResults,
          },
          unknownType: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(1, 20, 0),
          },
          pageBeyondTotal: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(100, 100, 1),
          },
          unknownSearchField: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(1, 20, 0),
          },
          noType: {
            description: 'bad request, type is required',
            statusCode: 400,
            response: expectTypeRequired,
          },
        },
      });

      findTest(`${scenario.users.dualAll.USERNAME} within the ${scenario.spaceId} space`, {
        auth: {
          username: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_USER.USERNAME,
          password: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_USER.PASSWORD,
        },
        spaceId: scenario.spaceId,
        tests: {
          spaceAwareType: {
            description: 'only the visualization',
            statusCode: 200,
            response: createExpectVisualizationResults(scenario.spaceId),
          },
          notSpaceAwareType: {
            description: 'only the globaltype',
            statusCode: 200,
            response: expectNotSpaceAwareResults,
          },
          unknownType: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(1, 20, 0),
          },
          pageBeyondTotal: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(100, 100, 1),
          },
          unknownSearchField: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(1, 20, 0),
          },
          noType: {
            description: 'bad request, type is required',
            statusCode: 400,
            response: expectTypeRequired,
          },
        },
      });

      findTest(`${scenario.users.dualRead.USERNAME} within the ${scenario.spaceId} space`, {
        auth: {
          username: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_DASHBOARD_ONLY_USER.USERNAME,
          password: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_DASHBOARD_ONLY_USER.PASSWORD,
        },
        spaceId: scenario.spaceId,
        tests: {
          spaceAwareType: {
            description: 'only the visualization',
            statusCode: 200,
            response: createExpectVisualizationResults(scenario.spaceId),
          },
          notSpaceAwareType: {
            description: 'only the globaltype',
            statusCode: 200,
            response: expectNotSpaceAwareResults,
          },
          unknownType: {
            description: 'forbidden find wigwags message',
            statusCode: 403,
            response: createExpectRbacForbidden('wigwags'),
          },
          pageBeyondTotal: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(100, 100, 1),
          },
          unknownSearchField: {
            description: 'forbidden find wigwags message',
            statusCode: 403,
            response: createExpectRbacForbidden('wigwags'),
          },
          noType: {
            description: 'bad request, type is required',
            statusCode: 400,
            response: expectTypeRequired,
          },
        },
      });

      findTest(`${scenario.users.allGlobally.USERNAME} within the ${scenario.spaceId} space`, {
        auth: {
          username: AUTHENTICATION.KIBANA_RBAC_USER.USERNAME,
          password: AUTHENTICATION.KIBANA_RBAC_USER.PASSWORD,
        },
        spaceId: scenario.spaceId,
        tests: {
          spaceAwareType: {
            description: 'only the visualization',
            statusCode: 200,
            response: createExpectVisualizationResults(scenario.spaceId),
          },
          notSpaceAwareType: {
            description: 'only the globaltype',
            statusCode: 200,
            response: expectNotSpaceAwareResults,
          },
          unknownType: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(1, 20, 0),
          },
          pageBeyondTotal: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(100, 100, 1),
          },
          unknownSearchField: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(1, 20, 0),
          },
          noType: {
            description: 'bad request, type is required',
            statusCode: 400,
            response: expectTypeRequired,
          },
        },
      });

      findTest(`${scenario.users.readGlobally.USERNAME} within the ${scenario.spaceId} space`, {
        auth: {
          username: AUTHENTICATION.KIBANA_RBAC_DASHBOARD_ONLY_USER.USERNAME,
          password: AUTHENTICATION.KIBANA_RBAC_DASHBOARD_ONLY_USER.PASSWORD,
        },
        spaceId: scenario.spaceId,
        tests: {
          spaceAwareType: {
            description: 'only the visualization',
            statusCode: 200,
            response: createExpectVisualizationResults(scenario.spaceId),
          },
          notSpaceAwareType: {
            description: 'only the globaltype',
            statusCode: 200,
            response: expectNotSpaceAwareResults,
          },
          unknownType: {
            description: 'forbidden find wigwags message',
            statusCode: 403,
            response: createExpectRbacForbidden('wigwags'),
          },
          pageBeyondTotal: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(100, 100, 1),
          },
          unknownSearchField: {
            description: 'forbidden find wigwags message',
            statusCode: 403,
            response: createExpectRbacForbidden('wigwags'),
          },
          noType: {
            description: 'bad request, type is required',
            statusCode: 400,
            response: expectTypeRequired,
          },
        },
      });

      findTest(`${scenario.users.allAtSpace.USERNAME} within the ${scenario.spaceId} space`, {
        auth: {
          username: scenario.users.allAtSpace.USERNAME,
          password: scenario.users.allAtSpace.PASSWORD,
        },
        spaceId: scenario.spaceId,
        tests: {
          spaceAwareType: {
            description: 'only the visualization',
            statusCode: 200,
            response: createExpectVisualizationResults(scenario.spaceId),
          },
          notSpaceAwareType: {
            description: 'only the globaltype',
            statusCode: 200,
            response: expectNotSpaceAwareResults,
          },
          unknownType: {
            description: 'forbidden and find wigwags message',
            statusCode: 403,
            response: createExpectRbacForbidden('wigwags'),
          },
          pageBeyondTotal: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(100, 100, 1),
          },
          unknownSearchField: {
            description: 'forbidden and find wigwags message',
            statusCode: 403,
            response: createExpectRbacForbidden('wigwags'),
          },
          noType: {
            description: 'bad request, type is required',
            statusCode: 400,
            response: expectTypeRequired,
          },
        },
      });

      findTest(`${scenario.users.readAtSpace.USERNAME} within the ${scenario.spaceId} space`, {
        auth: {
          username: scenario.users.readAtSpace.USERNAME,
          password: scenario.users.readAtSpace.PASSWORD,
        },
        spaceId: scenario.spaceId,
        tests: {
          spaceAwareType: {
            description: 'only the visualization',
            statusCode: 200,
            response: createExpectVisualizationResults(scenario.spaceId),
          },
          notSpaceAwareType: {
            description: 'only the globaltype',
            statusCode: 200,
            response: expectNotSpaceAwareResults,
          },
          unknownType: {
            description: 'forbidden and find wigwags message',
            statusCode: 403,
            response: createExpectRbacForbidden('wigwags'),
          },
          pageBeyondTotal: {
            description: 'empty result',
            statusCode: 200,
            response: createExpectEmpty(100, 100, 1),
          },
          unknownSearchField: {
            description: 'forbidden and find wigwags message',
            statusCode: 403,
            response: createExpectRbacForbidden('wigwags'),
          },
          noType: {
            description: 'bad request, type is required',
            statusCode: 400,
            response: expectTypeRequired,
          },
        },
      });

      findTest(`${scenario.users.allAtOtherSpace.USERNAME} within the ${scenario.spaceId} space`, {
        auth: {
          username: scenario.users.allAtOtherSpace.USERNAME,
          password: scenario.users.allAtOtherSpace.PASSWORD,
        },
        spaceId: scenario.spaceId,
        tests: {
          spaceAwareType: {
            description: 'forbidden login and find visualization message',
            statusCode: 403,
            response: createExpectRbacForbidden('visualization'),
          },
          notSpaceAwareType: {
            description: 'forbidden login and find globaltype message',
            statusCode: 403,
            response: createExpectRbacForbidden('globaltype'),
          },
          unknownType: {
            description: 'forbidden login and find wigwags message',
            statusCode: 403,
            response: createExpectRbacForbidden('wigwags'),
          },
          pageBeyondTotal: {
            description: 'forbidden login and find visualization message',
            statusCode: 403,
            response: createExpectRbacForbidden('visualization'),
          },
          unknownSearchField: {
            description: 'forbidden login and find wigwags message',
            statusCode: 403,
            response: createExpectRbacForbidden('wigwags'),
          },
          noType: {
            description: 'bad request, type is required',
            statusCode: 400,
            response: expectTypeRequired,
          },
        },
      });
    });
  });
}

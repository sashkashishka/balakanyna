import { Breadcrumb, type BreadcrumbProps } from 'antd';
import { useStore } from '@nanostores/react';

import {
  $router,
  openHome,
  openUserView,
  ROUTE_ALIAS,
  ROUTE_TITLE,
} from '@/stores/router';
import { useMemo } from 'react';

export function Breadcrumbs() {
  const { route, params } = useStore($router)!;

  const items = useMemo(() => {
    const tmpItems: BreadcrumbProps['items'] = [
      {
        title: ROUTE_TITLE[ROUTE_ALIAS.HOME],
        path: '',
        onClick(e) {
          e.preventDefault();
          openHome();
        },
      },
    ];

    switch (route) {
      case ROUTE_ALIAS.USER_VIEW:
      case ROUTE_ALIAS.USER_VIEW_TASKS:
      case ROUTE_ALIAS.USER_VIEW_PROGRAMS: {
        tmpItems.push(
          {
            title: 'User',
            path: '',
            onClick(e) {
              e.preventDefault();
              // @ts-expect-error id does exist
              openUserView(params.uid);
            },
          },
          {
            title: ROUTE_TITLE[route!],
          },
        );
        break;
      }

      default:
        tmpItems.push({
          title: route === ROUTE_ALIAS.HOME ? undefined : ROUTE_TITLE[route!],
        });
    }
    return tmpItems;
  }, [route]);

  return <Breadcrumb items={items} style={{ margin: '16px 0' }} />;
}

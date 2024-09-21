// Initializes the `download` service on path `/download`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Download } from './download.class';
import hooks from './download.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'download': Download & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/download', new Download(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('download');

  service.hooks(hooks);
}

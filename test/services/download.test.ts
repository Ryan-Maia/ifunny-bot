import app from '../../src/app';

describe('\'download\' service', () => {
  it('registered the service', () => {
    const service = app.service('download');
    expect(service).toBeTruthy();
  });
});

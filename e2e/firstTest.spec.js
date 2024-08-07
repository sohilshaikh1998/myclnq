describe('Main', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });


  it('Login Flow', async () => {
      await element(by.id('loginNumber')).typeText('1111111111');
      await element(by.id('loginPress')).tap();
      await element(by.id('loginPress')).tap();
      // await waitFor(element(by.id('progressLoaderLogin'))).toBeVisible();
      // await waitFor(element(by.id('progressLoaderLogin'))).toBeNotVisible();
      // await waitFor(element(by.id('typeOtp'))).toBeVisible().withTimeout(5000);
          //await element(by.id('typeOtp')).replaceText('8126');
      // await element(by.id('loginPress')).tap();
      // await element(by.id('loginPress')).tap();
  });

  // it('should open Medical Booking', async () => {
  //     await waitFor(element(by.id('doctorBooking'))).toBeVisible().withTimeout(2000);
  //     await element(by.id('doctorBooking')).tap();
  //     await element(by.id('HelpTour')).swipe("left");
  //     await element(by.id('HelpTour')).swipe("left");
  //     await element(by.id('HelpTour')).swipe("left");
  //     await element(by.id('StartButton')).tap();
  // });
  //
  // it('should open Medical Transport', async () => {
  //     await element(by.id('medicalTransport')).tap();
  //   //await element(by.id('Medical_Transport')).tap();
  // });
  //
  // it('should open Medical Caregiver', async () => {
  //
  //     await element(by.id('caregiver')).tap();
  //
  //     //await element(by.id('Medical_Caregiver')).tap();
  // });
  //
  // it('should open Medical Products', async () => {
  //     await element(by.id('medicalEquipment')).tap();
  //
  //     //await element(by.id('Medical_Products')).tap();
  // });

});

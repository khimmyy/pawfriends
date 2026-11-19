import { shareMessage } from '@/utils/share';

describe('shareMessage', () => {
  it('names the pet when the post is about one', () => {
    expect(shareMessage({ petName: 'Mochi', ownerName: 'Khim', caption: 'Zoomies!' })).toBe(
      'Mochi on PawFriends: "Zoomies!"'
    );
  });

  it('names the owner when no pet is tagged', () => {
    expect(shareMessage({ petName: null, ownerName: 'Khim', caption: 'Hello' })).toBe('Khim on PawFriends: "Hello"');
  });
});

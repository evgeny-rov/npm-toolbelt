import generateSvg from './generateSvg';

export const formatData = (format: string) => (data: string[]) => {
  if (format === 'svg') {
    return generateSvg(data);
  }

  return data;
};

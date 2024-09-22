import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { NotImplemented } from '@feathersjs/errors';
import { Application } from '../../declarations';
import axios from 'axios';
import { load } from 'cheerio';
import path from 'path';
import { createWriteStream } from 'fs';
import fetch from 'node-fetch'


interface Data {
  link: string;
}

interface ServiceOptions { }

export class Download {
  app: Application;
  options: ServiceOptions;

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async downloadVideo(url: string, filename: string) {
    // Fazendo a requisição com o 'axios' e indicando que a resposta será um stream de dados
    const res = await axios({
      url,  // URL do vídeo
      method: 'GET',
      responseType: 'stream'  // Importante: para receber os dados como um stream
    });

    // Caminho do arquivo onde o vídeo será salvo
    const dest = createWriteStream(path.join(__dirname, 'videos', filename));

    // Conectando o stream de resposta ao stream de escrita do arquivo
    res.data.pipe(dest);

    // Retorna uma promise que resolve ou rejeita com base no sucesso ou falha do download
    return new Promise((resolve, reject) => {
      dest.on('finish', () => {
        console.log(`Download concluído: ${filename}`);
        resolve(filename);  // Retorna o nome do arquivo ao concluir o download
      });

      dest.on('error', (err) => {
        console.error(`Erro ao baixar o vídeo: ${err}`);
        reject(err);  // Rejeita a promise se houver algum erro
      });
    });
  }

  async downloadVideoAsBase64(url: string): Promise<string> {
    // Fazendo a requisição com o 'axios' e indicando que a resposta será um stream de dados
    const res = await axios({
      url, // URL do vídeo
      method: 'GET',
      responseType: 'stream', // Importante: para receber os dados como um stream
    });

    // Array para armazenar os chunks de dados do stream
    const chunks: Uint8Array[] = [];

    // Retorna uma promise que resolve com a base64 do vídeo
    return new Promise((resolve, reject) => {
      res.data.on('data', (chunk: Uint8Array) => {
        chunks.push(chunk); // Armazena cada chunk de dados
      });

      res.data.on('end', () => {
        // Concatena todos os chunks e cria um buffer
        const buffer = Buffer.concat(chunks);

        // Converte o buffer para base64
        const base64String = buffer.toString('base64');

        resolve(base64String); // Retorna a string base64
      });

      res.data.on('error', (err: Error) => {
        console.error(`Erro ao baixar o vídeo: ${err}`);
        reject(err); // Rejeita a promise se houver algum erro
      });
    });
  }

  async create(data: Data, params?: Params): Promise<any> {
    const link = data.link;

    try {
      console.log(`Acessando: ${link}`);
      const { data: html } = await axios.get(link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      // Carrega o HTML da página
      const $ = load(html);

      // Seleciona o primeiro vídeo
      const videoElement = $('video')[0];
      if (videoElement) {
        const videoUrl = videoElement.attribs['data-src'];

        console.log(videoUrl);

        if (videoUrl) {
          return videoUrl;
          // const videoName = path.basename(videoUrl);
          // console.log(`Baixando vídeo: ${videoUrl}`);
          // return await this.downloadVideoAsBase64(videoUrl);
          // await this.downloadVideo(videoUrl, videoName);
          // console.log(`Vídeo salvo como: ${videoName}`);
        } else {
          console.log('URL do vídeo não encontrada.');
        }
      } else {
        console.log('Elemento de vídeo não encontrado.');
      }
    } catch (error) {
      console.error(`Erro ao processar o link ${link}:`, error);
    }

    return data;
  }

  async find(params?: Params): Promise<Data[] | Paginated<Data>> {
    throw new NotImplemented();
  }

  async get(id: Id, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }

  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }

  async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }

  async remove(id: NullableId, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }
}

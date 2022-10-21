import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){

  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return createPokemonDto;
    }catch(error){
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if( !isNaN(+term) )
    pokemon = await this.pokemonModel.findOne({ no: term });
    

    // Mongo ID
    if( !pokemon && isValidObjectId( term ))
    pokemon = await this.pokemonModel.findById( term );

    //Name
    if( !pokemon )
    pokemon = await this.pokemonModel.findOne({name:  term.toLocaleLowerCase().trim() })

    if( !pokemon ) 
    throw new NotFoundException(`Pokemon with id, no or name "${ term }" not found`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if( updatePokemonDto.name )
    updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    try{
      await pokemon.updateOne(updatePokemonDto, { new: true });
      return {...pokemon.toJSON(), ...updatePokemonDto};
    }catch(err){
      this.handleExceptions(err);
    }
    
  }

  async remove(id: string) {
    const {deletedCount} = await this.pokemonModel.deleteOne({ _id: id});
    if(deletedCount === 0 )
    throw new BadRequestException(`Pokemon with id ${ id } not found`);

    return;
  }

  private handleExceptions(err: any){
    if(err.code === 11000) throw new BadRequestException(`Pokemon exists in db ${JSON.stringify( err.keyValue )}`);
    throw new InternalServerErrorException(`Can't create - Check server logs`);
  }
}

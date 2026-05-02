import { assertEqual, testRunner } from '../build/utils.test.ts';
import { Network } from './main.ts';
import { tempFact } from '@gershy/disk';
import Logger from '@gershy/logger';
import './main.ts';

// Type testing
(async () => {
  
  type Enforce<Provided, Expected extends Provided> = { provided: Provided, expected: Expected };
  
  type Tests = {
    1: Enforce<{ x: 'y' }, { x: 'y' }>,
  };
  
  return null as any as Tests;
  
})();

testRunner([
  
  { name: 'not implemented', fn: async () => {
    
    // TODO: Implement!
    const network = new Network({
      name: 'testNetwork',
      freeBinDb: true,
      freeDocDb: false, // true,
      cheapEmail: false, // true,
      cheapQueue: false, // true,
      expensiveW3: false // TODO: Need to test this; it's currently not implemented
    });
    
    const fact = tempFact.kid([ Math.random().toString(36).slice(2) ]);
    const petals = await network.getPetals({
      
      name: 'testCtx',
      logger: Logger.dummy,
      fact,
      patioFact: fact.kid([ 'patio' ]),
      shedFact: fact.kid([ 'shed' ]),
      maturity: 'm0',
      debug: true,
      pfx: 'tzt',
      
      soil: {
        getRegion: () => 'ca-central-1'
      } as any
      // soil: new Soil.Base({
      //   logger: Logger.dummy,
      //   registry: new Registry({}),
      // })
      
    });
    const tfBlocks = await Promise.all(petals.map(p => p.getResult()));
    
    assertEqual(
      tfBlocks,
      [
        String[cl.baseline](`
          | data "aws_availability_zones" "test_network_vpc" { state = "available" }
        `),
        String[cl.baseline](`
          | resource "aws_vpc" "test_network_vpc" {
          |   cidr_block = "10.0.0.0/16"
          |   enable_dns_support = true
          |   enable_dns_hostnames = true
          | }
        `),
        String[cl.baseline](`
          | resource "aws_subnet" "test_network_vpc_private0" {
          |   vpc_id = aws_vpc.test_network_vpc.id
          |   cidr_block = "10.0.1.0/24"
          |   availability_zone = | data.aws_availability_zones.test_network_vpc.names[0]
          | }
        `),
        String[cl.baseline](`
          | resource "aws_route_table_association" "test_network_vpc_private0" {
          |   subnet_id = aws_subnet.test_network_vpc_private0.id
          |   route_table_id = aws_vpc.test_network_vpc.default_route_table_id
          | }
        `),
        String[cl.baseline](`
          | resource "aws_subnet" "test_network_vpc_private1" {
          |   vpc_id = aws_vpc.test_network_vpc.id
          |   cidr_block = "10.0.2.0/24"
          |   availability_zone = | data.aws_availability_zones.test_network_vpc.names[1]
          | }
        `),
        String[cl.baseline](`
          | resource "aws_route_table_association" "test_network_vpc_private1" {
          |   subnet_id = aws_subnet.test_network_vpc_private1.id
          |   route_table_id = aws_vpc.test_network_vpc.default_route_table_id
          | }
        `),
        String[cl.baseline](`
          | resource "aws_security_group" "test_network_vpc" {
          |   name = "testNetworkSecurityGroup"
          |   vpc_id = aws_vpc.test_network_vpc.id
          |   egress {
          |     from_port = 0
          |     to_port = 0
          |     protocol = "-1"
          |     cidr_blocks = [ "0.0.0.0/0" ]
          |   }
          | }
        `),
        String[cl.baseline](`
          | resource "aws_vpc_endpoint" "test_network_vpc_bin_db" {
          |   vpc_id = aws_vpc.test_network_vpc.id
          |   service_name = "com.amazonaws.ca-central-1.s3"
          |   vpc_endpoint_type = "Gateway"
          |   route_table_ids = [ aws_vpc.test_network_vpc.default_route_table_id ]
          | }
        `)
      ]
    );
    
  }}
  
]);